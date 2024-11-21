import { useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import FaqComponent from './components/Faq/FaqComponent';
import Material from './components/Material/Material';
import FaqManage from './components/Faq/FaqManage';
import EditMatList from './components/Material/EditMatList';
import EditMatList_SideBar from './components/Material/EditMatList_SideBar';

function App() {
  const [selectedNav, setSelectedNav] = useState("Home");
     
  const renderContent = () => {
    switch (selectedNav) {
        case "Home":
          return <h1>Welcome back John Lennon</h1>;
        case "Admin":
          return <h1>Admin</h1>;
        case "Faq":
          return <FaqComponent isAdmin={false}/>;
        case "FaqManage":
          return <FaqManage/>;
        case "AddFile":
          return <Material showRemoveFile={true} showDownloadFile={true} showAddingFile={true}/>
        case "EditMatList":
            return <EditMatList/>
        case "EditMatList_SideBar":
            return <EditMatList_SideBar/>
        default:
            return <h1>Imagine</h1>;
    }
};

  return (
    <>
    <Navbar expand="lg" className="bg-body-tertiary navbar-expand-lg">
      <Container>
        <Navbar.Brand href="#home">catchUp</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home" onClick={() => setSelectedNav("Home")}>Home</Nav.Link>
            <Nav.Link href="#admin" onClick={() => setSelectedNav("Admin")}>Admin</Nav.Link>
            <Nav.Link href="#faq" onClick={() => setSelectedNav("Faq")}>Faq</Nav.Link>
            <Nav.Link href="#faqmanage" onClick={() => setSelectedNav("FaqManage")}>FaqManage</Nav.Link>
            <Nav.Link href="#addfile" onClick={() => setSelectedNav("AddFile")}>AddFile</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#editmatlist" onClick={() => setSelectedNav("EditMatList")}>EditMatList</NavDropdown.Item>
              <NavDropdown.Item href="#editmatlist_sidebar" onClick={() => setSelectedNav("EditMatList_SideBar")}>EditMatList_SideBar</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    {renderContent()}

    <footer className="py-3 my-4 border-top">
      <p className="text-center text-muted">© 2024 UnhandledException</p>
    </footer>
    
    </>
  )
}

export default App
