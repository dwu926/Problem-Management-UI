import React, { useState, useEffect, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";
import "./table/index.scss";
import Table from "./table/Table";
import EnhancedTableHead from "./table/EnhancedTableHead";
import TableBody from "./table/TableBody";
import TableRow from "./table/TableRow";
import TableCell from "./table/TableCell";
import Checkbox from "./table/Checkbox";
import TableContainer from "./table/TableContainer";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import axios from "axios";
import Main from "./component/Main";

const headCells = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "ExceptionName",
  },
  {
    id: "Comments/RCA",
    numeric: true,
    disablePadding: false,
    label: "Comments/RCA",
  },
  {
    id: "ErrorTitle",
    numeric: true,
    disablePadding: false,
    label: "ErrorTitle",
  },
  { id: "ErrorMain", numeric: true, disablePadding: false, label: "ErrorMain" },
  // { id: "ErrorFeatures", numeric: true, disablePadding: false, label: "ErrorFeatures" },
];

const rows = [
  createData(
    "java.lang.IllegalArgumentException",
    "RuleDataAuditLogUtil",
    "java.lang.IllegalArgumentException: hasAbsencesInPeriod() :Incomplete/Inconsistent input parameters",
    "list of features",
    "RCA/Comments"
  ),
  createData(
    "java.lang.IllegalArgumentException",
    "FBSectUI_Objective",
    "java.lang.IllegalArgumentException: Illegal string value 'M'.  Legal values are 'O', 'G', 'T', 'R', 'S', 'V', 'F', 'W', 'Q', 'C', 'GM+'.",
    "list of features",
    "RCA/Comments"
  ),
  createData(
    "java.lang.IllegalArgumentException",
    "0COEMEventEditHandler",
    "java.lang.IllegalArgumentException: ContentTypeList does not contain a supported content type: image/*;q=0.8",
    "list of features",
    "RCA/Comments"
  ),
  createData(
    "java.lang.IllegalArgumentException",
    "RCMAssessmentScoreSubscriber",
    "Caused by: java.lang.IllegalArgumentException: Object Definition is Null for provided Object Type. Please ensure that the corresponding feature is enabled via Upgrade Center or Provisioning.",
    "List of features",
    "RCA/Comments"
  ),
  createData(
    "java.lang.IllegalArgumentException",
    "RuleDataAuditLogUtil",
    "java.lang.IllegalArgumentException: Object Definition is Null for provided Object Type. Please ensure that the corresponding feature is enabled via Upgrade Center or Provisioning.",
    "List of features",
    "RCA/Comments"
  ),
  createData(
    "java.lang.IllegalArgumentException",
    "RuleDataAuditLogUtil",
    "java.lang.IllegalArgumentException: Mandatory parameters were not supplied.",
    "list of features",
    "RCA/Comments"
  ),
];

function createData(ExceptionName, RCA, ErrorTitle, ErrorMain) {
  return { ExceptionName, RCA, ErrorTitle, ErrorMain };
}

function getSorting(order, orderBy) {
  return order === "desc"
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
}

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => {
    // console.log(el)
    return [el, index];
  });
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function App() {
  const [currentTime, setCurrentTime] = useState(1);
  const [ExceptionName, setExceptionName] = useState([]);
  const [ErrorTitle, setErrorTitle] = useState([]);
  const [ErrorMain, setErrorMain] = useState([]);
  const [ErrorFeatures, setErrorFeatures] = useState([]);
  const [RCA, setRCA] = useState([]);
  const inputRef = useRef();

  const [currentError, setCurrentError] = useState(null);

  useEffect(() => {
    fetch("/api/current")
      .then((res) => res.json())
      .then((data) => {
        setCurrentTime(data.time);
        setExceptionName(data.exception_name);
        setErrorTitle(data.error_title);
        setErrorMain(data.error_main);
        setErrorFeatures(data.error_features);
        setRCA(data.RCA);
      });
  }, []);

  let row = {};
  var i;
  const Rows = [];
  var string1, string2, string3, string4;

  for (i = 0; i < ExceptionName.length; i++) {
    string1 = ExceptionName[i];
    string2 = RCA[i];
    string3 = ErrorTitle[i];
    string4 = ErrorMain[i];

    row = createData(string1, string2, string3, string4);
    Rows.push(row);
    // console.log(row)
  }

  console.log(rows);
  console.log(Rows);
  const n = Rows.length;

  const myParams = new FormData();
  const mydata = {
    firstname: "Dong",
    lastname: "Wu",
  };

  myParams.append("data", mydata);

  /** this will send request to get exception and set to state, this will also trigger dialog popup */
  const handleGetErrorDetail = (expName) => {
    fetch("/api/log", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((json) => {
        setCurrentError(JSON.stringify(json));
      })
      .catch((error) => {
        console.log(error);
        //Perform action based on error
      });
  };

  /** clear the error message, also close the dialog */
  const handleDialogClose = () => {
    setCurrentError(null);
  };

  const handleFileChange = (e) => {
    const files = e.currentTarget.files;
    const currentFile = files[0];
    if (!currentFile) return;
    const formData = new FormData();
    formData.append("file", currentFile);
    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        console.log("response+++++++");
      })
      .catch((e) => console.error(e));
  };

  const handleFileSelection = () => {
    inputRef.current.click();
  };

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("ErrorTitle");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 20));
    setPage(0);
  };
  console.log("a" - "b");

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>
          Central Feedback System ({currentTime} | Error count: {n} )
        </h1>
      </header>
      <main className="App-main" key={"this is the main page"}>
        <input
          ref={inputRef}
          type="file"
          name="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleFileSelection}
        >
          +Upload
        </Button>
        <br />
        <Main />
        <br />
        <h2>
          This is the table of error/exception extract fron the raw log file
          with noise reduction
        </h2>
        <TableContainer>
          <Table>
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              headCells={headCells}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(Rows, getSorting(order, orderBy)).map(
                ({ ExceptionName, RCA, ErrorTitle, ErrorMain }) => {
                  const cellClickHandler = () => {
                    handleGetErrorDetail(ExceptionName);
                  };
                  return (
                    <TableRow key={RCA}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="promo-name">
                        {/* here onClick is event handler, it will trigger callback function, you can do anything you want inside the callback */}
                        <div onClick={cellClickHandler}>{ExceptionName}</div>
                      </TableCell>
                      <TableCell>{RCA}</TableCell>
                      <TableCell>{ErrorTitle}</TableCell>
                      <TableCell>{ErrorMain}</TableCell>
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={!!currentError}
          onClose={handleDialogClose}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
        >
          <DialogTitle id="scroll-dialog-title">Subscribe</DialogTitle>
          <DialogContent>
            <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
              {currentError}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <h1>Please input your analysis:</h1>
      </main>
    </div>
  );
}

export default App;
