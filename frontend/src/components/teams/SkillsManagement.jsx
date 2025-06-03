import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  ExclamationCircleIcon,
  UserIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { api } from '../../api';

const SkillsManagement = ({ projectId, teamMembers, currentUser }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [newSkill, setNewSkill] = useState({
    user_id: '',
    skill_name: '',
    proficiency_level: 'Beginner',
    years_experience: 0
  });

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const proficiencyColors = {
    'Beginner': 'bg-gray-100 text-gray-800 border-gray-200',
    'Intermediate': 'bg-blue-100 text-blue-800 border-blue-200',
    'Advanced': 'bg-green-100 text-green-800 border-green-200',
    'Expert': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectSkills();
    }
  }, [projectId]);

  const fetchProjectSkills = async () => {
    try {
      setLoading(true);
      const response = await api.projects.getSkills(projectId);
      setSkills(response.data.data.skills || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const response = await api.projects.addSkill(projectId, newSkill);
      setSkills([...skills, response.data.data.skill]);
      setNewSkill({
        user_id: '',
        skill_name: '',
        proficiency_level: 'Beginner',
        years_experience: 0
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding skill:', error);
      setError(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleUpdateSkill = async (skillId, updates) => {
    try {
      setError('');
      const response = await api.projects.updateSkill(skillId, updates);
      setSkills(skills.map(skill =>
        skill.id === skillId ? response.data.data.skill : skill
      ));
      setEditingSkill(null);
    } catch (error) {
      console.error('Error updating skill:', error);
      setError(error.response?.data?.message || 'Failed to update skill');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to remove this skill?')) {
      return;
    }

    try {
      setError('');
      await api.projects.deleteSkill(skillId);
      setSkills(skills.filter(skill => skill.id !== skillId));
    } catch (error) {
      console.error('Error deleting skill:', error);
      setError(error.response?.data?.message || 'Failed to remove skill');
    }
  };

  const canManageSkills = () => {
    return currentUser?.role === 'Admin' || currentUser?.role === 'Project Manager';
  };

  const canEditSkill = (skill) => {
    return canManageSkills() || skill.user_id === currentUser?.id;
  };

  const getSkillsByUser = () => {
    const skillsByUser = {};
    skills.forEach(skill => {
      if (!skillsByUser[skill.user_name]) {
        skillsByUser[skill.user_name] = [];
      }
      skillsByUser[skill.user_name].push(skill);
    });
    return skillsByUser;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading skills...</span>
        </div>
      </div>
    );
  }

  const skillsByUser = getSkillsByUser();

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrophyIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Team Skills</h3>
          </div>
          {canManageSkills() && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Skill
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        </div>
      )}

      {/* Add Skill Form */}
      {showAddForm && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Member
                </label>
                <select
                  value={newSkill.user_id}
                  onChange={(e) => setNewSkill({...newSkill, user_id: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select member</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  value={newSkill.skill_name}
                  onChange={(e) => setNewSkill({...newSkill, skill_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., JavaScript, React, Python"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proficiency
                </label>
                <select
                  value={newSkill.proficiency_level}
                  onChange={(e) => setNewSkill({...newSkill, proficiency_level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {proficiencyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="0.1"
                  value={newSkill.years_experience}
                  onChange={(e) => setNewSkill({...newSkill, years_experience: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors duration-150"
              >
                Add Skill
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Skills List */}
      <div className="px-6 py-4">
        {Object.keys(skillsByUser).length === 0 ? (
          <div className="text-center py-8">
            <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No skills recorded yet</p>
            {canManageSkills() && (
              <p className="text-sm text-gray-400 mt-1">
                Add skills to track team member expertise
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(skillsByUser).map(([userName, userSkills]) => (
              <div key={userName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <UserIcon className="h-4 w-4 text-gray-600 mr-2" />
                  <h4 className="font-medium text-gray-900">{userName}</h4>
                  <span className="ml-2 text-sm text-gray-500">
                    ({userSkills.length} skill{userSkills.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {userSkills.map(skill => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      proficiencyColors={proficiencyColors}
                      proficiencyLevels={proficiencyLevels}
                      canEdit={canEditSkill(skill)}
                      isEditing={editingSkill === skill.id}
                      onEdit={() => setEditingSkill(skill.id)}
                      onSave={(updates) => handleUpdateSkill(skill.id, updates)}
                      onCancel={() => setEditingSkill(null)}
                      onDelete={() => handleDeleteSkill(skill.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Skill Card Component
const SkillCard = ({ 
  skill, 
  proficiencyColors, 
  proficiencyLevels, 
  canEdit, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete 
}) => {
  const [editData, setEditData] = useState({
    proficiency_level: skill.proficiency_level,
    years_experience: skill.years_experience
  });

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {skill.skill_name}
            </label>
            <select
              value={editData.proficiency_level}
              onChange={(e) => setEditData({...editData, proficiency_level: e.target.value})}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {proficiencyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Experience (years)
            </label>
            <input
              type="number"
              min="0"
              max="99"
              step="0.1"
              value={editData.years_experience}
              onChange={(e) => setEditData({...editData, years_experience: parseFloat(e.target.value) || 0})}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-1 pt-1">
            <button
              onClick={onCancel}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors duration-150"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
            <button
              onClick={handleSave}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-150"
            >
              <CheckIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors duration-150">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h5 className="font-medium text-gray-900 text-sm">{skill.skill_name}</h5>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${proficiencyColors[skill.proficiency_level]}`}>
              {skill.proficiency_level}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {skill.years_experience} year{skill.years_experience !== 1 ? 's' : ''} experience
          </p>
        </div>
        {canEdit && (
          <div className="flex space-x-1 ml-2">
            <button
              onClick={onEdit}
              className="p-1 text-gray-600 hover:text-blue-600 transition-colors duration-150"
            >
              <PencilIcon className="h-3 w-3" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-600 hover:text-red-600 transition-colors duration-150"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsManagement;
