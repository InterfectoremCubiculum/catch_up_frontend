import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Provider/authProvider';
import { getFeedbacks, deleteFeedback } from '../../services/feedbackService';
import { FeedbackDto } from '../../dtos/FeedbackDto';
import NotificationToast from '../Toast/NotificationToast';
import Loading from '../Loading/Loading';
import { getRole } from '../../services/userService';
import FeedbackItem from './FeedbackItem';
import ConfirmModal from '../Modal/ConfirmModal'; 


const FeedbackListPage: React.FC = () => {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState<FeedbackDto[]>([]);
    const [feedbackToDelete, setFeedbackToDelete] = useState<FeedbackDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastColor, setToastColor] = useState('');
    const [apiError, setApiError] = useState(false);

    useEffect(() => {
        const loadFeedbacks = async () => {
            if (!user) return;
            try {
                const userRoleResponse = await getRole(user.id ?? 'defaultId');
                setIsAdmin(userRoleResponse !== 'Newbie');
                const feedbackList = await getFeedbacks(user.id ?? 'defaultId', userRoleResponse !== 'Newbie');
                setFeedbacks(feedbackList);
            } catch (error) {
                setApiError(true);
            } finally {
                setIsLoading(false);
            }
        };
    
        loadFeedbacks();
    }, [user]);

    const handleDelete = async () => {
        if (!feedbackToDelete || feedbackToDelete.id === undefined) return;
    
        try {
            await deleteFeedback(feedbackToDelete.id);
            setFeedbacks(feedbacks.filter((feedback) => feedback.id !== feedbackToDelete.id));
            setToastMessage('Feedback successfully deleted');
            setToastColor('green');
            setShowToast(true);
        } catch (error) {
            setToastMessage('Failed to delete feedback');
            setToastColor('red');
            setShowToast(true);
        } finally {
            setFeedbackToDelete(null);
        }
    };

    if (isLoading) {
        return (
            <div className="m-3">
                <Loading />
            </div>
        );
    }

    if (apiError) {
        return <div className="alert alert-danger text-center mt-5 mb-5 ms-6 me-6 container">Error: API is not available</div>;
    }

    return (
        <>
            <div className="container">
                <h3 className="text-center mt-3">Feedbacks</h3>
                {!feedbacks.length ? (
                    <div className="alert alert-secondary text-center">No feedbacks found</div>
                ) : (
                    <table className="table table-striped mt-3">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>{isAdmin ? 'Sender' : 'Receiver'}</th>
                                <th>Date</th>
                                <th>Resource Type</th>
                                <th>Resource Title</th>
                                <th colSpan={2}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbacks.map((feedback) => (
                                <FeedbackItem 
                                    key={feedback.id} 
                                    feedback={feedback} 
                                    isAdmin={isAdmin} 
                                    onDeleteClick={setFeedbackToDelete} 
                                />
                            ))}
                        </tbody>
                    </table>
                )}

                <ConfirmModal
                    show={!!feedbackToDelete}
                    title="Delete Feedback"
                    message={`Are you sure you want to delete the feedback titled: ${feedbackToDelete?.title}`}
                    onConfirm={handleDelete}
                    onCancel={() => setFeedbackToDelete(null)}
                />
            </div>

            <NotificationToast
                show={showToast}
                title="Feedback Operation"
                message={toastMessage}
                color={toastColor}
                onClose={() => setShowToast(false)}
            />
        </>
    );
};

export default FeedbackListPage;
