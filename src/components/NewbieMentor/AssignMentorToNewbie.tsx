import React, { useState, useEffect } from 'react';
import { Table, Alert, Spinner, Button, Modal } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import NewbieMentorService from '../../services/newbieMentorService';
import { UserDto } from '../../dtos/UserDto';
import './NewbieMentor.css';
import Loading from '../Loading/Loading';

const AssignMentorToNewbieComponent: React.FC = () => {
  const [newbieMentors, setNewbieMentors] = useState<UserDto[]>([]);
  const [selectedNewbieId, setSelectedNewbieId] = useState<string | null>(null);
  const [selectedNewbieName, setSelectedNewbieName] = useState<string | null>(null);
  const [selectedNewbieSurname, setSelectedNewbieSurname] = useState<string | null>(null);
  const [assignedMentors, setAssignedMentors] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [unassignedMentors, setUnassignedMentors] = useState<UserDto[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [deletingMentorId, setDeletingMentorId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // dla Mentora
  const [searchTermAssigned, setSearchTermAssigned] = useState<string>('');
  const [searchTermUnassigned, setSearchTermUnassigned] = useState<string>('');

  const [sortConfigNewbies, setSortConfigNewbies] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  });

  const [sortConfigAssigned, setSortConfigAssigned] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  });

  const [sortConfigUnassigned, setSortConfigUnassigned] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  });

  //  Filtr dla każdej tabeli z osobna
  const filteredMentors = newbieMentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.surname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignedNewbies = assignedMentors.filter(
    (newbie) =>
      newbie.name.toLowerCase().includes(searchTermAssigned.toLowerCase()) ||
      newbie.surname.toLowerCase().includes(searchTermAssigned.toLowerCase())
  );

  const filteredUnassignedNewbies = unassignedMentors.filter(
    (newbie) =>
      newbie.name.toLowerCase().includes(searchTermUnassigned.toLowerCase()) ||
      newbie.surname.toLowerCase().includes(searchTermUnassigned.toLowerCase())
  );

  useEffect(() => {
    fetchNewbies();
  }, []);

  const fetchNewbies = async () => {
    setLoading(true);
    setError('');
    try {
      const newbies = await NewbieMentorService.getAllNewbies();
      const newbiesWithMentorCount = await Promise.all(
        newbies.map(async (newbie) => {
          newbie.assignCount = await NewbieMentorService.getMentorCountByNewbie(newbie.id);
          return { ...newbie };
        })
      );
      setNewbieMentors(newbiesWithMentorCount);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching mentors newbies');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedMentors = async (newbieId: string) => {
   // setLoading(true);
    //console.log(newbieId);
    setError('');
    try {
      const mentors = await NewbieMentorService.getAssignmentsByNewbie(newbieId);
      //console.log(mentors);
      setAssignedMentors(mentors);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching assigned mentors');
      setAssignedMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedMentors = async (newbieId: string) => {
   // setLoading(true);
    setError('');
    try {
      const mentors = await NewbieMentorService.getAllUnassignedMentors(newbieId);
      setUnassignedMentors(mentors);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching unassigned mentors');
      setUnassignedMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewbieClick = (newbieId: string, newbieName: string, newbieSubname: string) => {
    setSelectedNewbieName(newbieName);
    setSelectedNewbieSurname(newbieSubname);
    setSelectedNewbieId(newbieId);
    fetchAssignedMentors(newbieId);
    fetchUnassignedMentors(newbieId);
  };

  const handleDeleteClick = (newbieId: string) => {
    setDeletingMentorId(newbieId);
    setShowModal(true);
  };

  const handleUnassign = async () => {
    if (deletingMentorId && selectedNewbieId) {
  //    setLoading(true);
      setError('');
      try {
        await NewbieMentorService.Unassign(selectedNewbieId, deletingMentorId);
        setAssignedMentors((prev) => prev.filter((mentor) => mentor.id !== deletingMentorId));
        setShowModal(false);
        fetchAssignedMentors(selectedNewbieId);
        fetchUnassignedMentors(selectedNewbieId);
        fetchNewbies();
      } catch (error: any) {
        setError(error.message || 'An error occurred while deleting the assignment');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAssignMentor = async (mentorId: string) => {
    if (selectedNewbieId) {
   //   setLoading(true);
      setError('');
      try {
        await NewbieMentorService.assignNewbieToMentor(selectedNewbieId, mentorId);
        fetchAssignedMentors(selectedNewbieId);
        fetchUnassignedMentors(selectedNewbieId);
        fetchNewbies();
      } catch (error: any) {
        setError(error.message || 'An error occurred while assigning the newbie to the mentor');
      } finally {
        setLoading(false);
      }
    }
  };

  // Sortowanie mentorów
  const sortedNewbies = filteredMentors.sort((a, b) => {
    const aValue = a[sortConfigNewbies.key as keyof UserDto]?.toString().toLowerCase() || '';
    const bValue = b[sortConfigNewbies.key as keyof UserDto]?.toString().toLowerCase() || '';

    if (aValue < bValue) {
      return sortConfigNewbies.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfigNewbies.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Sortowanie przypisanych nowicjuszy
  const sortedAssigned = filteredAssignedNewbies.sort((a, b) => {
    const aValue = a[sortConfigAssigned.key as keyof UserDto]?.toString().toLowerCase() || '';
    const bValue = b[sortConfigAssigned.key as keyof UserDto]?.toString().toLowerCase() || '';

    if (aValue < bValue) {
      return sortConfigAssigned.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfigAssigned.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Sortowanie nieprzypisanych nowicjuszy
  const sortedUnassigned = filteredUnassignedNewbies.sort((a, b) => {
    const aValue = a[sortConfigUnassigned.key as keyof UserDto]?.toString().toLowerCase() || '';
    const bValue = b[sortConfigUnassigned.key as keyof UserDto]?.toString().toLowerCase() || '';

    if (aValue < bValue) {
      return sortConfigUnassigned.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfigUnassigned.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Funkcja obsługująca sortowanie
  const handleSort = (key: string, table: 'newbies' | 'assigned' | 'unassigned') => {
    let direction: 'asc' | 'desc' = 'asc';

    // Sprawdzanie, czy klucz to ten sam, który jest już sortowany
    if (table === 'newbies' && sortConfigNewbies.key === key && sortConfigNewbies.direction === 'asc') {
      direction = 'desc';
      setSortConfigNewbies({ key, direction });
    }
    else if (table === 'assigned' && sortConfigAssigned.key === key && sortConfigAssigned.direction === 'asc') {
      direction = 'desc';
      setSortConfigAssigned({ key, direction });
    }
    else if (table === 'unassigned' && sortConfigUnassigned.key === key && sortConfigUnassigned.direction === 'asc') {
      direction = 'desc';
      setSortConfigUnassigned({ key, direction });
    }
    else {
      if (table === 'newbies') setSortConfigNewbies({ key, direction });
      else if (table === 'assigned') setSortConfigAssigned({ key, direction });
      else if (table === 'unassigned') setSortConfigUnassigned({ key, direction });
    }
  };



  return (
    <div className="container mt-5">
      <h2>List of Newbies</h2>

      {loading ? (
        <Loading />
      ) : (
        <div className="row">
          <div className="col-md-6">
            <div className="mt-4">
              <div className="mb-3">
                <h3>Newbies</h3>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search newbie by name or surname..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </div>
              <Table id="newbies" striped bordered hover responsive>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name', 'newbies')} style={{ cursor: 'pointer' }}>
                      Name <i className="bi bi-arrow-down-up"></i>
                    </th>
                    <th onClick={() => handleSort('surname', 'newbies')} style={{ cursor: 'pointer' }}>
                      Surname <i className="bi bi-arrow-down-up"></i>
                    </th>
                    <th onClick={() => handleSort('position', 'newbies')} style={{ cursor: 'pointer' }}>
                      Position <i className="bi bi-arrow-down-up"></i>
                    </th>
                    <th onClick={() => handleSort('assignCount', 'newbies')} style={{ cursor: 'pointer' }}>
                      Number of Newbies <i className="bi bi-arrow-down-up"></i>
                    </th>

                  </tr>
                </thead>
                <tbody>
                  {sortedNewbies.map((newbie) => (
                    <tr
                      key={newbie.id}
                      onClick={() => handleNewbieClick(newbie.id, newbie.name, newbie.surname)}
                      style={{ cursor: 'pointer' }}
                      className={newbie.id === selectedNewbieId ? 'table-active' : ''}>
                      <td>{newbie.name}</td>
                      <td>{newbie.surname}</td>
                      <td>{newbie.position}</td>
                      <td>{newbie.assignCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
          <div className="col-md-6">
            {selectedNewbieId && (
              <div className="mt-4">
                <h3>Assigned Mentor to {selectedNewbieName} {selectedNewbieSurname}</h3>
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search assigned mentor by name or surname..."
                      value={searchTermAssigned}
                      onChange={(e) => setSearchTermAssigned(e.target.value)}
                    />
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                  </div>
                </div>
                <Table id="assigned" striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name', 'assigned')} style={{ cursor: 'pointer' }}>
                        Name <i className="bi bi-arrow-down-up"></i></th>
                      <th onClick={() => handleSort('surname', 'assigned')} style={{ cursor: 'pointer' }}>
                        Surname <i className="bi bi-arrow-down-up"></i></th>
                      <th onClick={() => handleSort('position', 'assigned')} style={{ cursor: 'pointer' }}>
                        Position <i className="bi bi-arrow-down-up"></i></th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAssigned.map((mentor) => (
                      <tr key={mentor.id}>
                        <td>{mentor.name}</td>
                        <td>{mentor.surname}</td>
                        <td>{mentor.position}</td>
                        <td>
                          <Button variant="danger" onClick={() => handleDeleteClick(mentor.id)}>Unassign</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
            {selectedNewbieId && (
              <div className="mt-4">
                <h3>Unassigned Mentor from {selectedNewbieName} {selectedNewbieSurname}</h3>
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search unassigned mentor by name or surname..."
                      value={searchTermUnassigned}
                      onChange={(e) => setSearchTermUnassigned(e.target.value)}
                    />
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                  </div>
                </div>
                <Table id="unassigned" striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name', 'unassigned')} style={{ cursor: 'pointer' }}>
                        Name <i className="bi bi-arrow-down-up"></i></th>
                      <th onClick={() => handleSort('surname', 'unassigned')} style={{ cursor: 'pointer' }}>
                        Surname <i className="bi bi-arrow-down-up"></i></th>
                      <th onClick={() => handleSort('position', 'unassigned')} style={{ cursor: 'pointer' }}>
                        Position <i className="bi bi-arrow-down-up"></i></th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUnassigned.map((newbie) => (
                      <tr key={newbie.id}>
                        <td>{newbie.name}</td>
                        <td>{newbie.surname}</td>
                        <td>{newbie.position}</td>
                        <td>
                          <Button
                            variant="primary"
                            onClick={() => handleAssignMentor(newbie.id)}
                          >
                            Assign
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Unassignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to unassign this newbie from this mentor?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleUnassign}>
            Unassign
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssignMentorToNewbieComponent;
