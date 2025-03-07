import { useState, useEffect } from 'react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [tasks, setTasks] = useState({});
  const [birthdays, setBirthdays] = useState({});
  const [view, setView] = useState('calendar'); 
  const [newItem, setNewItem] = useState({ title: '', description: '' });
  
  const [holidays, setHolidays] = useState({
    '2025-01-01': { title: 'New Year\'s Day', type: 'holiday' },
    '2025-01-14': { title: 'Makar Sankranti / Pongal', type: 'holiday' },
    '2025-01-26': { title: 'Republic Day', type: 'holiday' },
    '2025-03-07': { title: 'Holi', type: 'holiday' },
    '2025-04-14': { title: 'Dr. Ambedkar Jayanti', type: 'holiday' },
    '2025-04-03': { title: 'Mahavir Jayanti', type: 'holiday' },
    '2025-04-11': { title: 'Good Friday', type: 'holiday' },
    '2025-04-13': { title: 'Easter', type: 'holiday' },
    '2025-05-01': { title: 'Labor Day', type: 'holiday' },
    '2025-05-23': { title: 'Eid ul-Fitr', type: 'holiday' },
    '2025-08-15': { title: 'Independence Day', type: 'holiday' },
    '2025-08-19': { title: 'Raksha Bandhan', type: 'holiday' },
    '2025-08-27': { title: 'Janmashtami', type: 'holiday' },
    '2025-09-02': { title: 'Ganesh Chaturthi', type: 'holiday' },
    '2025-10-02': { title: 'Gandhi Jayanti', type: 'holiday' },
    '2025-10-24': { title: 'Dussehra', type: 'holiday' },
    '2025-10-31': { title: 'Diwali', type: 'holiday' },
    '2025-11-01': { title: 'Govardhan Puja', type: 'holiday' },
    '2025-11-12': { title: 'Guru Nanak Jayanti', type: 'holiday' },
    '2025-12-25': { title: 'Christmas', type: 'holiday' },
  });

  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    const savedTasks = localStorage.getItem('calendar-tasks');
    const savedBirthdays = localStorage.getItem('calendar-birthdays');
    
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedBirthdays) setBirthdays(JSON.parse(savedBirthdays));
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
    localStorage.setItem('calendar-tasks', JSON.stringify(tasks));
    localStorage.setItem('calendar-birthdays', JSON.stringify(birthdays));
  }, [events, tasks, birthdays]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getItemsForDate = (date) => {
    const dateKey = formatDateKey(date);
    const dateItems = [];
    
    if (holidays[dateKey]) {
      dateItems.push({ ...holidays[dateKey], color: '#FF9999' });
    }
    
    if (events[dateKey]) {
      events[dateKey].forEach(event => {
        dateItems.push({ ...event, color: '#99CCFF' });
      });
    }
    
    if (tasks[dateKey]) {
      tasks[dateKey].forEach(task => {
        dateItems.push({ ...task, color: '#99FF99' });
      });
    }
    
    if (birthdays[dateKey]) {
      birthdays[dateKey].forEach(birthday => {
        dateItems.push({ ...birthday, color: '#FFCC99' });
      });
    }
    
    return dateItems;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const addItem = () => {
    if (!newItem.title.trim()) return;

    const dateKey = formatDateKey(selectedDate);
    
    if (view === 'add-event') {
      const updatedEvents = { ...events };
      if (!updatedEvents[dateKey]) updatedEvents[dateKey] = [];
      updatedEvents[dateKey].push({ 
        title: newItem.title, 
        description: newItem.description, 
        type: 'event' 
      });
      setEvents(updatedEvents);
    } 
    else if (view === 'add-task') {
      const updatedTasks = { ...tasks };
      if (!updatedTasks[dateKey]) updatedTasks[dateKey] = [];
      updatedTasks[dateKey].push({ 
        title: newItem.title, 
        description: newItem.description, 
        type: 'task',
        completed: false 
      });
      setTasks(updatedTasks);
    } 
    else if (view === 'add-birthday') {
      const updatedBirthdays = { ...birthdays };
      if (!updatedBirthdays[dateKey]) updatedBirthdays[dateKey] = [];
      updatedBirthdays[dateKey].push({ 
        title: newItem.title, 
        description: newItem.description, 
        type: 'birthday' 
      });
      setBirthdays(updatedBirthdays);
    }
    
    setNewItem({ title: '', description: '' });
    setView('calendar');
  };

  const toggleTaskCompletion = (dateKey, index) => {
    const updatedTasks = { ...tasks };
    updatedTasks[dateKey][index].completed = !updatedTasks[dateKey][index].completed;
    setTasks(updatedTasks);
  };

  const deleteItem = (dateKey, index, type) => {
    if (type === 'event') {
      const updatedEvents = { ...events };
      updatedEvents[dateKey].splice(index, 1);
      if (updatedEvents[dateKey].length === 0) delete updatedEvents[dateKey];
      setEvents(updatedEvents);
    } 
    else if (type === 'task') {
      const updatedTasks = { ...tasks };
      updatedTasks[dateKey].splice(index, 1);
      if (updatedTasks[dateKey].length === 0) delete updatedTasks[dateKey];
      setTasks(updatedTasks);
    } 
    else if (type === 'birthday') {
      const updatedBirthdays = { ...birthdays };
      updatedBirthdays[dateKey].splice(index, 1);
      if (updatedBirthdays[dateKey].length === 0) delete updatedBirthdays[dateKey];
      setBirthdays(updatedBirthdays);
    }
  };

  const renderCalendar = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(monthEnd);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }
    
    const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
    const rows = [];
    let days = [];
    let day = new Date(startDate);
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dateKey = formatDateKey(cloneDay);
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
        const isToday = day.toDateString() === new Date().toDateString();
        const isSelected = day.toDateString() === selectedDate.toDateString();
        const items = getItemsForDate(cloneDay);
        
        days.push(
          <div 
            key={day.toString()} 
            className={`p-1 border min-h-16 ${isCurrentMonth ? 'bg-white' : 'bg-gray-100'} 
                       ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'} 
                       ${isSelected ? 'bg-blue-50' : ''}`}
            onClick={() => {
              setSelectedDate(new Date(cloneDay));
              setView('calendar');
            }}
          >
            <div className="flex justify-between">
              <span className={`text-sm font-semibold ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                {day.getDate()}
              </span>
              {items.length > 0 && (
                <span className="text-xs bg-gray-200 rounded-full px-1">
                  {items.length}
                </span>
              )}
            </div>
            <div className="overflow-y-auto max-h-12">
              {items.slice(0, 2).map((item, idx) => (
                <div key={idx} className="text-xs truncate my-1 px-1 rounded" style={{ backgroundColor: item.color }}>
                  {item.title}
                </div>
              ))}
              {items.length > 2 && (
                <div className="text-xs text-gray-500">+{items.length - 2} more</div>
              )}
            </div>
          </div>
        );
        
        day.setDate(day.getDate() + 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{dateFormat.format(currentDate)}</h2>
          <div>
            <button onClick={prevMonth} className="px-2 py-1 mx-1 bg-gray-200 rounded">←</button>
            <button onClick={goToToday} className="px-2 py-1 mx-1 bg-gray-200 rounded">Today</button>
            <button onClick={nextMonth} className="px-2 py-1 mx-1 bg-gray-200 rounded">→</button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-0 mb-1">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center font-semibold pb-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded border border-gray-200">
          {rows}
        </div>
      </div>
    );
  };

  const renderDayDetails = () => {
    const dateKey = formatDateKey(selectedDate);
    const items = getItemsForDate(selectedDate);
    const dateFormat = new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{dateFormat.format(selectedDate)}</h3>
          <div>
            <button 
              onClick={() => setView('add-event')} 
              className="px-2 py-1 mx-1 bg-blue-100 text-blue-700 rounded text-sm"
            >
              + Event
            </button>
            <button 
              onClick={() => setView('add-task')} 
              className="px-2 py-1 mx-1 bg-green-100 text-green-700 rounded text-sm"
            >
              + Task
            </button>
            <button 
              onClick={() => setView('add-birthday')} 
              className="px-2 py-1 mx-1 bg-orange-100 text-orange-700 rounded text-sm"
            >
              + Birthday
            </button>
          </div>
        </div>
        
        {items.length === 0 ? (
          <p className="text-gray-500 mt-2">No items for this date.</p>
        ) : (
          <div className="mt-2">
            {items.map((item, index) => (
              <div 
                key={index} 
                className="p-2 my-1 rounded flex items-start justify-between" 
                style={{ backgroundColor: item.color }}
              >
                <div>
                  <div className="flex items-center">
                    {item.type === 'task' && (
                      <input 
                        type="checkbox" 
                        checked={item.completed} 
                        onChange={() => toggleTaskCompletion(dateKey, index)}
                        className="mr-2"
                      />
                    )}
                    <span className={`font-medium ${item.type === 'task' && item.completed ? 'line-through' : ''}`}>
                      {item.title}
                    </span>
                    <span className="ml-2 text-xs capitalize bg-white bg-opacity-50 px-1 rounded">
                      {item.type}
                    </span>
                  </div>
                  {item.description && <p className="text-sm mt-1">{item.description}</p>}
                </div>
                {item.type !== 'holiday' && (
                  <button 
                    onClick={() => deleteItem(dateKey, index, item.type)} 
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAddForm = () => {
    let title = '';
    if (view === 'add-event') title = 'Add New Event';
    else if (view === 'add-task') title = 'Add New Task';
    else if (view === 'add-birthday') title = 'Add Birthday Reminder';
    
    const dateFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return (
      <div className="mt-4 p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">Date: {dateFormat.format(selectedDate)}</p>
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            {view === 'add-birthday' ? 'Person\'s Name' : 'Title'}:
          </label>
          <input 
            type="text" 
            name="title"
            value={newItem.title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder={view === 'add-birthday' ? "Enter person's name" : "Enter title"}
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Description (optional):
          </label>
          <textarea 
            name="description"
            value={newItem.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Enter description"
            rows="3"
          />
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={() => setView('calendar')}
            className="px-3 py-1 mr-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={addItem}
            className="px-3 py-1 bg-blue-500 text-white rounded"
            disabled={!newItem.title.trim()}
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Indian Calendar 2025</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
        <div className="lg:col-span-6">
          {renderCalendar()}
        </div>
        
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-bold mb-2">Legend</h3>
            <div className="text-sm">
              <div className="flex items-center mb-1">
                <span className="inline-block w-3 h-3 mr-2 rounded" style={{ backgroundColor: '#FF9999' }}></span>
                <span>Holidays</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-3 h-3 mr-2 rounded" style={{ backgroundColor: '#99CCFF' }}></span>
                <span>Events</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-3 h-3 mr-2 rounded" style={{ backgroundColor: '#99FF99' }}></span>
                <span>Tasks</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-3 h-3 mr-2 rounded" style={{ backgroundColor: '#FFCC99' }}></span>
                <span>Birthdays</span>
              </div>
            </div>
          </div>
          
         
          <div>
            <h3 className="font-bold mb-2">Today's Reminders</h3>
            {getItemsForDate(new Date()).length > 0 ? (
              <div className="text-sm">
                {getItemsForDate(new Date()).map((item, idx) => (
                  <div key={idx} className="mb-1 p-1 rounded" style={{ backgroundColor: item.color }}>
                    {item.title}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No reminders for today</p>
            )}
          </div>
        </div>
      </div>
      
      {view === 'calendar' ? renderDayDetails() : renderAddForm()}
    </div>
  );
};

export default Calendar;