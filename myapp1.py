from flask import Flask, flash, request, redirect, url_for, session, render_template
from flask_cors import CORS, cross_origin
import time
import math
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.python.framework import ops
import glob
import nltk # natural language process package
import re
import datetime


app = Flask(__name__)
CORS(app)


def isTimeFormat (timeStr):
    try:
        time.strptime(timeStr, '%H:%M:%S')                       # for time only
#        datetime.datetime.strptime(timeStr, '%m/%d/%y')         # for date only
#        datetime.datetime.strptime(timeStr, '%m/%d/%y %H:%M:%S') # for full date and time
        return True
    except ValueError:
        return False



filenames = [log for log in glob.glob("C:/Users/i533432/Desktop/Python_ML/Data Acquisition for AI_ML model for Error Analysis/ExceptionData/SplunkData/15min/*.txt")]

#filenames = [log for log in glob.glob("C:/Users/i533432/Desktop/Python_ML/Data Acquisition for AI_ML model for Error Analysis/ExceptionData/test/*.txt")]


filenames.sort() # ADD THIS LINE

Log_file = []

for log in filenames:
#    df = pd.read_csv(log)
    f = open(log, 'r')
    
    Log_file.append(f)


features_all_event = []
features_single_event = []
exception = []
error_title = []
error_main_line = []
error_type = []

event_start = False
event_end = False
feature_start = False


n_file = 0  # the exception log file that will be analyzed for example: 1 is for IllegalStatementException and 2 is for IllegalArgumentException etc

# lines = Log_file[n_file].read().splitlines()

for line in Log_file[n_file]:

# Custermize my own words parshing schema and format
    
    line = line.strip("\n,\t, \ ")
    words = re.split(',| ', line)
    words = [re.sub(r' ?\([^)]+\)', '', item) for item in words]

#    words = re.findall(r'\w+|\(\w+\s+\w+\)', line) # this will give me all the individual letter in the line
    if event_start == False:                            # starting to extract the features for the current event
        
        if isTimeFormat(words[0]) and words[2] == "ERROR":  # A new error event confirmed and initialized
            
            event_start = True
            feature_start = True
            
            if features_single_event != []:
                
                error_title.append(line)

            else:
                
                if error_title != []:
                    
                    error_title[-1] = line

                else:
                    
                    error_title.append(line)           
            
        else:                                               # start to record the features for the current Exception
                        
            if words[0] == "Caused" and feature_start:      # if there is a "Caused by:"
                
                if exception != []:                         # change the current Exception by the "Caused by:" Exception
                    exception[-1] = words[2][:-1]
                    features_single_event = []
                    event_end = False
                else:                                       # append the Exception from "Caused by:" Exception if there is no Exception list
                    exception.append(words[2][:-1])
                    features_single_event = []
                    event_end = False
                
                error_main_line[-1] = line
            
            elif words[0] == "at" and feature_start:        # record the stack track 
                        
                if event_end == False:
                    
                    features_single_event.append(words[1])
                
            
            elif words[0] != "at" and words[0] != "Caused" and words[0] != "ClassName:" and feature_start:  # find the end of the error/event for corresponding Exception 
                                
                if features_single_event != []:                
                    
                    event_end = True
                    feature_start = False
            
    elif event_start == True:                   # True means the a new error event ready and in the following to capture the Exception

        if isTimeFormat(words[0]) is True:

            if words[2] == "ERROR":
                
                event_start = True
                
            else:
                
                event_start = False
                feature_start = False
                
                if features_single_event != [] :
                
                    features_all_event.append(features_single_event)
                    
                    features_single_event = []
                
        else:                                   # dealing with repeat time event
            
            event_end = False
            
            if words[0][-10:-1] == "Exception" or words[0][-9:] == "Exception": # dealing with exception in the main line and Exception start from 1st letter
                
                exception.append(words[0][:-1])
                event_start = False                     # the new event is start for feature extracting so set it to false and ready for the next event
                error_main_line.append(line)
            
            elif words == [""]:                         # dealing with space line
                                
                if features_single_event != [] :
                
                    features_all_event.append(features_single_event)
                    
                    features_single_event = []                    
            
            else:                                       # dealing with Exception from 2nd letter
                
                if words[1][-10:-1] == "Exception":
                
                    exception.append(words[1][:-1])
                    event_start = False                     # the new event is start for feature extracting so set it to false and ready for the next event
                    error_main_line.append(line)
            
            if features_single_event != [] :                # append the features for the previous Exception then reset the features and make it ready for the current Exception
                
                features_all_event.append(features_single_event)
                
                features_single_event = []
                

    #print(words[-10:-1])
    #print(exception)

            
features_all_event.append(features_single_event)

# extract the error type from the error_title line

for line in error_title:
    
    words = re.split(',| ', line)
    words = [re.sub(r' ?\([^)]+\)', '', item) for item in words]
    
    error_type.append(words[3][1:-1])

# noise reduction by grouping and remove the repeats by checking error_main_line

permutation = []

unique_error_main = []

for error in error_main_line:
    
    if error not in unique_error_main:
        
        unique_error_main.append(error)
        permutation.append(error_main_line.index(error))

unique_error_title = list(error_title[i] for i in permutation)
unique_exception = list(exception[i] for i in permutation)
unique_features = list(features_all_event[i] for i in permutation)
unique_error_type = list(error_type[i] for i in permutation)

# further noise reduction by checking error_features

permutation_enhanced = []

unique_features_enhanced = []

for feature in unique_features:
    
    if feature not in unique_features_enhanced:
        
        unique_features_enhanced.append(feature)
        permutation_enhanced.append(unique_features.index(feature))

unique_error_title_enhanced = list(unique_error_title[i] for i in permutation_enhanced)
unique_exception_enhanced = list(unique_exception[i] for i in permutation_enhanced)
unique_error_main_enhanced = list(unique_error_main[i] for i in permutation_enhanced)
unique_error_type_enhanced = list(unique_error_type[i] for i in permutation_enhanced)

@app.route('/api/current', methods=['GET', 'POST'])
def get_current_data (): 

    if request.method == 'GET':
        return {
        # 'exception_name': unique_exception_enhanced,
        # 'error_title': unique_error_title_enhanced,
        # 'error_main': unique_error_main_enhanced,
        # 'error_features': unique_features_enhanced,
        
        'exception_name': unique_exception_enhanced,
        'error_title': unique_error_title_enhanced,
        'error_main': unique_error_main_enhanced,
        'error_features': unique_features_enhanced,
        'RCA': ['Architecture/Design Flaw','Boundary Condition Missing','Coding Issue','Coding Standards Violation','Configuration Issue','Database Issue','Deployment Issue','Enviroment Issue','Hardware Issue','Incorrect Requirement','Incorrect UX Requirement','Logic Error','Missing Design','Coding Issue','Database Issue'],
        # 'RCA': [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],
        'time': datetime.datetime.now(),
         }

@app.route('/api/log', methods=['GET', 'POST'])
def get_log_data (): 
    
    if request.method == 'GET':
        return {
        'error_features': unique_features_enhanced,
         }
    

@app.route('/api/upload', methods = ['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        data = request.get_current_data()
        print(file)
        print(data)
        return "done"
    if request.method == 'GET':
        return "<h1>This is the page for uploading your own log file</h1> <br/> <button onClick=>Click</button> to upload your file "

@app.route('/')
def home():
    return "Hello this is the main page <button>Hello</button>"

if __name__ == "__main__":
    app.run(host = '127.0.0.1', port = 5000 , debug=True)