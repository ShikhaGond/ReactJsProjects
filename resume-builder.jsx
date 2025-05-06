import { useState } from 'react';
import { Download, Trash, PlusCircle, Save } from 'lucide-react';

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      title: '',
      email: '',
      phone: '',
      address: '',
      summary: ''
    },
    education: [
      { id: 1, institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' }
    ],
    experience: [
      { id: 1, company: '', position: '', startDate: '', endDate: '', description: '' }
    ],
    skills: [
      { id: 1, name: '' }
    ]
  });
  
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [previewMode, setPreviewMode] = useState(false);

  // Input change handlers
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [name]: value
      }
    });
  };

  const handleSectionItemChange = (section, id, field, value) => {
    setResumeData({
      ...resumeData,
      [section]: resumeData[section].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  // Add new items to sections
  const addSectionItem = (section) => {
    const newId = Math.max(0, ...resumeData[section].map(item => item.id)) + 1;
    let newItem = { id: newId };
    
    if (section === 'education') {
      newItem = { ...newItem, institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' };
    } else if (section === 'experience') {
      newItem = { ...newItem, company: '', position: '', startDate: '', endDate: '', description: '' };
    } else if (section === 'skills') {
      newItem = { ...newItem, name: '' };
    }
    
    setResumeData({
      ...resumeData,
      [section]: [...resumeData[section], newItem]
    });
  };

  // Remove items from sections
  const removeSectionItem = (section, id) => {
    if (resumeData[section].length > 1) {
      setResumeData({
        ...resumeData,
        [section]: resumeData[section].filter(item => item.id !== id)
      });
    }
  };

  // Download resume as JSON
  const downloadResume = () => {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.download = `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_resume.json`;
    link.href = url;
    link.click();
  };

  // Save resume data to local storage
  const saveResume = () => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    alert('Resume saved successfully!');
  };

  // Load resume data from local storage on component mount
  const loadSavedResume = () => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      setResumeData(JSON.parse(savedData));
      alert('Resume loaded successfully!');
    } else {
      alert('No saved resume found.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-center">Resume Builder</h1>
        </div>
      </header>
      
      {/* Action Buttons */}
      <div className="bg-gray-200 py-3">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="w-full flex justify-center items-center px-4 py-2 rounded bg-white text-blue-600 hover:bg-blue-100 border border-blue-600 font-medium"
            >
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={saveResume}
              className="w-full flex justify-center items-center px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-medium"
            >
              <Save size={16} className="mr-1" /> Save
            </button>
            <button
              onClick={loadSavedResume}
              className="w-full flex justify-center items-center px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
            >
              Load
            </button>
            <button
              onClick={downloadResume}
              className="w-full flex justify-center items-center px-4 py-2 rounded bg-blue-800 hover:bg-blue-900 text-white font-medium"
            >
              <Download size={16} className="mr-1" /> Export
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Editor Section */}
        {!previewMode && (
          <div className="lg:w-1/2 bg-white rounded shadow p-6">
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveSection('personalInfo')}
                  className={`px-4 py-2 rounded ${activeSection === 'personalInfo' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveSection('education')}
                  className={`px-4 py-2 rounded ${activeSection === 'education' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Education
                </button>
                <button
                  onClick={() => setActiveSection('experience')}
                  className={`px-4 py-2 rounded ${activeSection === 'experience' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Experience
                </button>
                <button
                  onClick={() => setActiveSection('skills')}
                  className={`px-4 py-2 rounded ${activeSection === 'skills' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Skills
                </button>
              </div>

              {/* Personal Info Section */}
              {activeSection === 'personalInfo' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={resumeData.personalInfo.name}
                        onChange={handlePersonalInfoChange}
                        className="w-full p-2 border rounded"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                      <input
                        type="text"
                        name="title"
                        value={resumeData.personalInfo.title}
                        onChange={handlePersonalInfoChange}
                        className="w-full p-2 border rounded"
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={resumeData.personalInfo.email}
                        onChange={handlePersonalInfoChange}
                        className="w-full p-2 border rounded"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={resumeData.personalInfo.phone}
                        onChange={handlePersonalInfoChange}
                        className="w-full p-2 border rounded"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={resumeData.personalInfo.address}
                        onChange={handlePersonalInfoChange}
                        className="w-full p-2 border rounded"
                        placeholder="123 Main St, City, State"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                      <textarea
                        name="summary"
                        value={resumeData.personalInfo.summary}
                        onChange={handlePersonalInfoChange}
                        className="w-full p-2 border rounded"
                        rows="4"
                        placeholder="Brief overview of your professional background and key strengths"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Section */}
              {activeSection === 'education' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Education</h2>
                    <button 
                      onClick={() => addSectionItem('education')}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <PlusCircle size={16} className="mr-1" /> Add Education
                    </button>
                  </div>
                  
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="border rounded p-4 relative">
                      <button 
                        onClick={() => removeSectionItem('education', edu.id)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      >
                        <Trash size={16} />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleSectionItemChange('education', edu.id, 'institution', e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="University Name"
                          />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <input type="text" value={edu.degree} onChange={(e) => handleSectionItemChange('education', edu.id, 'degree', e.target.value)}  className="w-full p-2 border rounded"placeholder="Bachelor of Science"/>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                        <input type="text" value={edu.field} onChange={(e) => handleSectionItemChange('education', edu.id, 'field', e.target.value)} className="w-full p-2 border rounded"placeholder="Computer Science"/>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input type="text" value={edu.startDate} onChange={(e) => handleSectionItemChange('education', edu.id, 'startDate', e.target.value)}
                              className="w-full p-2 border rounded" placeholder="MM/YYYY"/>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                              type="text"
                              value={edu.endDate}
                              onChange={(e) => handleSectionItemChange('education', edu.id, 'endDate', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="MM/YYYY or Present"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={edu.description}
                            onChange={(e) => handleSectionItemChange('education', edu.id, 'description', e.target.value)}
                            className="w-full p-2 border rounded"
                            rows="3"
                            placeholder="Notable achievements, GPA, etc."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Experience Section */}
              {activeSection === 'experience' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Work Experience</h2>
                    <button 
                      onClick={() => addSectionItem('experience')}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <PlusCircle size={16} className="mr-1" /> Add Experience
                    </button>
                  </div>
                  
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="border rounded p-4 relative">
                      <button 
                        onClick={() => removeSectionItem('experience', exp.id)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      >
                        <Trash size={16} />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleSectionItemChange('experience', exp.id, 'company', e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Company Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => handleSectionItemChange('experience', exp.id, 'position', e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Job Title"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) => handleSectionItemChange('experience', exp.id, 'startDate', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="MM/YYYY"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                              type="text"
                              value={exp.endDate}
                              onChange={(e) => handleSectionItemChange('experience', exp.id, 'endDate', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="MM/YYYY or Present"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => handleSectionItemChange('experience', exp.id, 'description', e.target.value)}
                            className="w-full p-2 border rounded"
                            rows="4"
                            placeholder="Describe your responsibilities and achievements"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Section */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Skills</h2>
                    <button 
                      onClick={() => addSectionItem('skills')}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <PlusCircle size={16} className="mr-1" /> Add Skill
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center">
                        <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => handleSectionItemChange('skills', skill.id, 'name', e.target.value)}
                          className="flex-1 p-2 border rounded"
                        placeholder="e.g. JavaScript, Project Management"
                        />
                        <button 
                        onClick={() => removeSectionItem('skills', skill.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                        <Trash size={16} />
                        </button>
                    </div>
                    ))}
                </div>
                </div>
            )}
            </div>
        </div>
        )}

        {/* Preview Section */}
        <div className={`${previewMode ? 'w-full' : 'lg:w-1/2'} bg-white rounded shadow`}>
        <div className="p-8 max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 pb-6 border-b">
            <h1 className="text-3xl font-bold mb-2">{resumeData.personalInfo.name || 'Your Name'}</h1>
            <p className="text-lg text-gray-600 mb-4">{resumeData.personalInfo.title || 'Professional Title'}</p>
            
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
                {resumeData.personalInfo.email && (
                <span>{resumeData.personalInfo.email}</span>
                )}
                {resumeData.personalInfo.phone && (
                <span>• {resumeData.personalInfo.phone}</span>
                )}
                {resumeData.personalInfo.address && (
                <span>• {resumeData.personalInfo.address}</span>
                )}
            </div>
            </div>
            
            {/* Summary */}
            {resumeData.personalInfo.summary && (
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-blue-700 border-b pb-1">Professional Summary</h2>
                <p className="text-gray-700">{resumeData.personalInfo.summary}</p>
            </div>
            )}
            
            {/* Experience */}
            {resumeData.experience.length > 0 && resumeData.experience[0].company && (
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-blue-700 border-b pb-1">Work Experience</h2>
                {resumeData.experience.map((exp) => (
                <div key={exp.id} className="mb-4">
                    <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{exp.position || 'Position'}</h3>
                    <span className="text-sm text-gray-600">
                        {exp.startDate || 'Start Date'} - {exp.endDate || 'End Date'}
                    </span>
                    </div>
                    <p className="text-gray-800 mb-1">{exp.company || 'Company'}</p>
                    <p className="text-gray-700 text-sm whitespace-pre-line">{exp.description}</p>
                </div>
                ))}
            </div>
            )}
            
            {/* Education */}
            {resumeData.education.length > 0 && resumeData.education[0].institution && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-blue-700 border-b pb-1">Education</h2>
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="mb-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{edu.institution || 'Institution'}</h3>
                      <span className="text-sm text-gray-600">
                        {edu.startDate || 'Start Date'} - {edu.endDate || 'End Date'}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-1">
                      {edu.degree || 'Degree'}{edu.field ? `, ${edu.field}` : ''}
                    </p>
                    <p className="text-gray-700 text-sm">{edu.description}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Skills */}
            {resumeData.skills.length > 0 && resumeData.skills[0].name && (
              <div>
                <h2 className="text-xl font-bold mb-3 text-blue-700 border-b pb-1">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill) => (
                    skill.name && (
                      <span 
                        key={skill.id} 
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {skill.name}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}