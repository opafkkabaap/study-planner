import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Menu</h2>
        <button className="hamburger">☰</button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/pomodoro">Pomodoro Timer</NavLink>
          </li>
          <li>
            <NavLink to="/schedule">Week's Schedule</NavLink>
          </li>
          <li>
            <NavLink to="/progress">Track your progress</NavLink>
          </li>
          <li>
            <NavLink to="/exams">Exam Dates</NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/account">Account Settings</NavLink>
      </div>
    </aside>
  );
}