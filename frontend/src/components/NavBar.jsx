// components/NavBar.jsx
import { NavLink } from 'react-router-dom';
import styles from './NavBar.module.css';

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Cite&Sight AI</div>
      <div className={styles.links}>
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? styles.active : styles.link}
        >
          Text Summarizer
        </NavLink>
        <NavLink 
          to="/meetings" 
          className={({ isActive }) => isActive ? styles.active : styles.link}
        >
          Meeting Notes
        </NavLink>
        
        {/* NEW: Link to the Citation Formatter */}
        <NavLink 
          to="/citations" 
          className={({ isActive }) => isActive ? styles.active : styles.link}
        >
          Citation Formatter
        </NavLink>
      </div>
    </nav>
  );
}