import React, { useState, useEffect } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import NewbieMentorService from '../../services/newbieMentorService';
import { UserDto } from '../../dtos/UserDto';
import './NewbieMentor.css';
import Loading from '../Loading/Loading';

const AssignNewbieToMentorComponent: React.FC = () => {
  const [newbieMentors, setNewbieMentors] = useState<UserDto[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [selectedMentorName, setSelectedMentorName] = useState<string | null>(null);
  const [selectedMentorSurname, setSelectedMentorSurname] = useState<string | null>(null);
  const [assignedNewbies, setAssignedNewbies] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string>('');
  const [unassignedNewbies, setUnassignedNewbies] = useState<UserDto[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [deletingNewbieId, setDeletingNewbieId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // dla Mentora
  const [searchTermAssigned, setSearchTermAssigned] = useState<string>('');
  const [searchTermUnassigned, setSearchTermUnassigned] = useState<string>('');

  const [sortConfigMentors, setSortConfigMentors] = useState<{ key: string, direction: 'asc' | 'desc' }>({
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

  const filteredAssignedNewbies = assignedNewbies.filter(
    (newbie) =>
      newbie.name.toLowerCase().includes(searchTermAssigned.toLowerCase()) ||
      newbie.surname.toLowerCase().includes(searchTermAssigned.toLowerCase())
  );

  const filteredUnassignedNewbies = unassignedNewbies.filter(
    (newbie) =>
      newbie.name.toLowerCase().includes(searchTermUnassigned.toLowerCase()) ||
      newbie.surname.toLowerCase().includes(searchTermUnassigned.toLowerCase())
  );

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    setError('');
    try {
      const mentors = await NewbieMentorService.getAllMentors();
      const mentorsWithNewbiesCount = await Promise.all(
        mentors.map(async (mentor) => {
          mentor.assignCount = await NewbieMentorService.getNewbieCountByMentor(mentor.id);
          return { ...mentor };
        })
      );
      setNewbieMentors(mentorsWithNewbiesCount);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching newbie mentors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedNewbies = async (mentorId: string) => {
    // setLoading(true);
    setError('');
    try {
      const newbies = await NewbieMentorService.getAssignmentsByMentor(mentorId);
      setAssignedNewbies(newbies);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching assigned newbies');
      setAssignedNewbies([]);
    } finally {
      // setLoading(false);
    }
  };

  const fetchUnassignedNewbies = async (mentorId: string) => {
    //setLoading(true);
    setError('');
    try {
      const newbies = await NewbieMentorService.getAllUnassignedNewbies(mentorId);
      setUnassignedNewbies(newbies);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching unassigned newbies');
      setUnassignedNewbies([]);
    } finally {
      //setLoading(false);
    }
  };

  const handleMentorClick = (mentorId: string, mentorName: string, mentorSubname: string) => {
    setSelectedMentorName(mentorName);
    setSelectedMentorSurname(mentorSubname);
    setSelectedMentorId(mentorId);
    fetchAssignedNewbies(mentorId);
    fetchUnassignedNewbies(mentorId);
  };

  const handleDeleteClick = (newbieId: string) => {
    setDeletingNewbieId(newbieId);
    setShowModal(true);
  };

  const handleUnassign = async () => {
    if (deletingNewbieId && selectedMentorId) {
      setLoading(true);
      setError('');
      try {
        await NewbieMentorService.Unassign(deletingNewbieId, selectedMentorId);
        setAssignedNewbies((prev) => prev.filter((newbie) => newbie.id !== deletingNewbieId));
        setShowModal(false);
        fetchAssignedNewbies(selectedMentorId);
        fetchUnassignedNewbies(selectedMentorId);
        fetchMentors();
      } catch (error: any) {
        setError(error.message || 'An error occurred while deleting the assignment');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAssignNewbie = async (newbieId: string) => {
    if (selectedMentorId) {
      setLoading(true);
      setError('');
      try {
        await NewbieMentorService.assignNewbieToMentor(newbieId, selectedMentorId);
        fetchAssignedNewbies(selectedMentorId);
        fetchUnassignedNewbies(selectedMentorId);
        fetchMentors();
      } catch (error: any) {
        setError(error.message || 'An error occurred while assigning the newbie to the mentor');
      } finally {
        setLoading(false);
      }
    }
  };

  // Sortowanie mentorów
  const sortedMentors = filteredMentors.sort((a, b) => {
    const aValue = a[sortConfigMentors.key as keyof UserDto]?.toString().toLowerCase() || '';
    const bValue = b[sortConfigMentors.key as keyof UserDto]?.toString().toLowerCase() || '';

    if (aValue < bValue) {
      return sortConfigMentors.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfigMentors.direction === 'asc' ? 1 : -1;
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
  const handleSort = (key: string, table: 'mentors' | 'assigned' | 'unassigned') => {
    let direction: 'asc' | 'desc' = 'asc';

    // Sprawdzanie, czy klucz to ten sam, który jest już sortowany
    if (table === 'mentors' && sortConfigMentors.key === key && sortConfigMentors.direction === 'asc') {
      direction = 'desc';
      setSortConfigMentors({ key, direction });
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
      if (table === 'mentors') setSortConfigMentors({ key, direction });
      else if (table === 'assigned') setSortConfigAssigned({ key, direction });
      else if (table === 'unassigned') setSortConfigUnassigned({ key, direction });
    }
  };



  return (
    <div className="container mt-5">
      <h2>List of Mentors</h2>

      {loading ? (
        <Loading />
      ) : (
        <div className="row">
          <div className="col-md-6">
            <div className="mt-4">
              <div className="mb-3">
                <h3>Mentors</h3>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search mentor by name or surname..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </div>
              <Table id="mentors" striped bordered hover responsive>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name', 'mentors')} style={{ cursor: 'pointer' }}>
                      Name <i className="bi bi-arrow-down-up"></i>
                    </th>
                    <th onClick={() => handleSort('surname', 'mentors')} style={{ cursor: 'pointer' }}>
                      Surname <i className="bi bi-arrow-down-up"></i>
                    </th>
                    <th onClick={() => handleSort('position', 'mentors')} style={{ cursor: 'pointer' }}>
                      Position <i className="bi bi-arrow-down-up"></i>
                    </th>
                    <th onClick={() => handleSort('assignCount', 'mentors')} style={{ cursor: 'pointer' }}>
                      Number of Newbies <i className="bi bi-arrow-down-up"></i>
                    </th>

                  </tr>
                </thead>
                <tbody>
                  {sortedMentors.map((mentor) => (
                    <tr
                      key={mentor.id}
                      onClick={() => handleMentorClick(mentor.id, mentor.name, mentor.surname)}
                      style={{ cursor: 'pointer' }}
                      className={mentor.id === selectedMentorId ? 'table-active' : ''}>
                      <td>{mentor.name}</td>
                      <td>{mentor.surname}</td>
                      <td>{mentor.position}</td>
                      <td>{mentor.assignCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
          <div className="col-md-6">
            {selectedMentorId && (
              <div className="mt-4">
                <h3>Assigned Newbies to {selectedMentorName} {selectedMentorSurname}</h3>
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search assigned newbies by name or surname..."
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
                    {sortedAssigned.map((newbie) => (
                      <tr key={newbie.id}>
                        <td>{newbie.name}</td>
                        <td>{newbie.surname}</td>
                        <td>{newbie.position}</td>
                        <td>
                          <Button variant="danger" onClick={() => handleDeleteClick(newbie.id)}>Unassign</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
            {selectedMentorId && (
              <div className="mt-4">
                <h3>Unassigned Newbies from {selectedMentorName} {selectedMentorSurname}</h3>
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search unassigned newbies by name or surname..."
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
                            onClick={() => handleAssignNewbie(newbie.id)}
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

export default AssignNewbieToMentorComponent;
