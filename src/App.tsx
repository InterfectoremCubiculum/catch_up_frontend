import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import AuthProvider, { useAuth } from './Provider/authProvider';
import ProtectedRoute from './Routes/ProtectedRoute';
import LoginPage from './components/Login/LoginComponent';
import FaqComponent from './components/Faq/FaqComponent';
import Material from './components/Material/Material';
import FaqManage from './components/Faq/FaqManage';
import AssignTask from './components/TaskAssigment/AssignTask';
import TaskContentManage from './components/Task/TaskContentManage';
import EditMatList from './components/Material/EditMatList';
import EditMatList_SideBar from './components/Material/EditMatList_SideBar';
import RoadMapManage from './components/RoadMap/RoadMapManage';
import EmployesAssignmentSelector from './components/NewbieMentor/EmployesAssignmentSelector';

const AppContent = () => {
    const { user } = useAuth();

    const materialCreated = (materialId: number) => {
        console.log('Zwrócono id nowo utworzonego materiału', materialId);
        return materialId;
    };

    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary navbar-expand-lg">
                <Container>
                    <Navbar.Brand href="/">catchUp</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                            <Nav.Link href="/admin">Admin</Nav.Link>
                            <Nav.Link href="/faq">Faq</Nav.Link>
                            <Nav.Link href="/faqmanage">FaqManage</Nav.Link>
                            <Nav.Link href="/addfile">AddFile</Nav.Link>
                            <Nav.Link href="/employesassignment">EmployesAssignment</Nav.Link>
                            <Nav.Link href="/assigntask">AssignTask</Nav.Link>
                            <Nav.Link href="/taskcontentmanage">TaskContentManage</Nav.Link>
                            <Nav.Link href="/roadmapmanage">RoadMapManage</Nav.Link>
                            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/editmatlist">EditMatList</NavDropdown.Item>
                                <NavDropdown.Item href="/editmatlist_sidebar">EditMatList_SideBar</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <h1>Welcome back {user?.name}</h1>
                        </ProtectedRoute>
                    }
                />
                <Route path="/admin" element={<ProtectedRoute><h1>Admin</h1></ProtectedRoute>} />
                <Route path="/faq" element={<ProtectedRoute><FaqComponent isAdmin={false} /></ProtectedRoute>} />
                <Route path="/faqmanage" element={<ProtectedRoute><FaqManage /></ProtectedRoute>} />
                <Route path="/addfile" element={
                    <ProtectedRoute>
                        <Material
                            materialId={1060}
                            showRemoveFile={true}
                            showDownloadFile={true}
                            showAddingFile={true}
                            materialCreated={materialCreated}
                        />
                    </ProtectedRoute>
                } />
                <Route path="/employesassignment" element={<ProtectedRoute><EmployesAssignmentSelector /></ProtectedRoute>} />
                <Route path="/assigntask" element={<ProtectedRoute><AssignTask /></ProtectedRoute>} />
                <Route path="/taskcontentmanage" element={<ProtectedRoute><TaskContentManage /></ProtectedRoute>} />
                <Route path="/editmatlist" element={<ProtectedRoute><EditMatList /></ProtectedRoute>} />
                <Route path="/editmatlist_sidebar" element={<ProtectedRoute><EditMatList_SideBar /></ProtectedRoute>} />
                <Route path="/roadmapmanage" element={<ProtectedRoute><RoadMapManage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            <footer className="py-3 my-4 border-top">
                <p className="text-center text-muted">© 2024 UnhandledException</p>
            </footer>
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                    <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;