import React from "react";
import ReactDOM from "react-dom";

function App() {
  return <div className="App">Hello World!</div>;
}

const myJSX = <div className="App">Hello World!</div>
console.log(myJSX)

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
