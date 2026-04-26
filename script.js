const USER_DB_KEY = "physicsCodeUsers";
const API_REGISTER = "/api/register";
const API_USERS = "/api/users";
const API_ADMIN_LOGIN = "/api/admin/login";

function getDatabaseUsersSync() {
  const stored = localStorage.getItem(USER_DB_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveDatabaseUsersSync(users) {
  localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
}

function addDatabaseUserSync(user) {
  const users = getDatabaseUsersSync();
  users.push(user);
  saveDatabaseUsersSync(users);
}

async function getDatabaseUsers() {
  try {
    const response = await fetch(API_USERS);
    if (!response.ok) {
      throw new Error("Server error while loading users.");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to load users from server:", error);
    return getDatabaseUsersSync();
  }
}

async function addDatabaseUser(user) {
  try {
    const response = await fetch(API_REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      throw new Error("Server error while saving registration.");
    }

    return await response.json();
  } catch (error) {
    console.error("Server register failed:", error);
    addDatabaseUserSync(user);
    return { fallback: true };
  }
}

async function updateDatabaseUser(id, user) {
  try {
    const response = await fetch(`${API_USERS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      throw new Error("Server error while updating user.");
    }

    return await response.json();
  } catch (error) {
    console.error("Server update failed:", error);
    return { error: error.message };
  }
}

async function deleteDatabaseUser(id) {
  try {
    const response = await fetch(`${API_USERS}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error("Server error while deleting user.");
    }

    return await response.json();
  } catch (error) {
    console.error("Server delete failed:", error);
    return { error: error.message };
  }
}

async function renderAdminUsers(searchTerm = "") {
  const users = await getDatabaseUsers();
  const userList = document.getElementById("user-list");
  const count = document.getElementById("user-count");
  const recentCount = document.getElementById("recent-registrations");

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  count.textContent = filteredUsers.length;

  // Calculate recent registrations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = users.filter(user => new Date(user.registeredAt) > thirtyDaysAgo);
  recentCount.textContent = recentUsers.length;

  if (!filteredUsers.length) {
    if (searchTerm) {
      userList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h4>No students found</h4>
          <p>No students match your search criteria</p>
        </div>
      `;
    } else {
      userList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-users"></i>
          <h4>No students registered yet</h4>
          <p>Students will appear here once they register on the website</p>
        </div>
      `;
    }
    return;
  }

  userList.innerHTML = filteredUsers
    .map(
      (user) => `
        <div class="user-row" data-user-id="${user.id}">
          <div class="user-info">
            <strong>${user.name}</strong>
            <span>${user.email}</span>
            <span>${user.phone}</span>
            <small>Registered: ${new Date(user.registeredAt).toLocaleDateString()}</small>
          </div>
          <div class="user-actions">
            <button class="btn small edit-btn" data-action="edit">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn small delete-btn" data-action="delete">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `
    )
    .join("");

  // Attach event listeners to dynamically created buttons
  document.querySelectorAll(".user-row").forEach((row) => {
    const userId = row.dataset.userId;
    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");
    const user = filteredUsers.find(u => u.id == userId);

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        openEditModal(userId, user.name, user.email, user.phone);
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        confirmDelete(userId);
      });
    }
  });
}

function exportData() {
  // Get all users
  getDatabaseUsers().then(users => {
    if (!users.length) {
      showNotification("No data to export", "error");
      return;
    }

    // Convert to CSV
    const headers = ["ID", "Name", "Email", "Phone", "Registration Date"];
    const csvContent = [
      headers.join(","),
      ...users.map(user => [
        user.id,
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.phone}"`,
        `"${new Date(user.registeredAt).toLocaleDateString()}"`
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `physics_code_students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("Data exported successfully!", "success");
  });
}

async function confirmDelete(id) {
  console.log("Delete clicked for user ID:", id);
  if (confirm("Are you sure you want to delete this user?")) {
    const result = await deleteDatabaseUser(id);
    console.log("Delete result:", result);
    if (result.success) {
      alert("User deleted successfully!");
      await renderAdminUsers();
    } else {
      alert("Failed to delete user: " + (result.error || "Unknown error"));
    }
  }
}

async function openEditModal(id, name, email, phone) {
  console.log("Edit clicked for user ID:", id);
  const editModal = document.getElementById("editModal");
  document.getElementById("editUserId").value = id;
  document.getElementById("editName").value = name;
  document.getElementById("editEmail").value = email;
  document.getElementById("editPhone").value = phone;
  editModal.classList.remove("hidden");
}

function closeEditModal() {
  const editModal = document.getElementById("editModal");
  editModal.classList.add("hidden");
}

async function submitEditForm(event) {
  event.preventDefault();
  const id = document.getElementById("editUserId").value;
  const name = document.getElementById("editName").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const phone = document.getElementById("editPhone").value.trim();

  if (!name || !email || !phone) {
    alert("Please fill in all fields.");
    return;
  }

  const result = await updateDatabaseUser(id, { name, email, phone });
  if (result.success) {
    alert("User updated successfully!");
    closeEditModal();
    await renderAdminUsers();
  } else {
    alert("Failed to update user: " + (result.error || "Unknown error"));
  }
}

async function showAdminDashboard(show) {
  const loginCard = document.getElementById("adminLogin");
  const dashboard = document.getElementById("admin-dashboard");
  loginCard.classList.toggle("hidden", show);
  dashboard.classList.toggle("hidden", !show);

  if (show) {
    await renderAdminUsers();
    document.getElementById("admin-message").textContent = "";
  }
}

async function submitRegisterForm(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.querySelector("#name").value.trim();
  const email = form.querySelector("#email").value.trim();
  const phone = form.querySelector("#phone").value.trim();
  const password = form.querySelector("#password").value.trim();

  if (!name || !email || !phone || !password) {
    showNotification("Please complete all registration fields.", "error");
    return;
  }

  // Show loading state
  const submitBtn = form.querySelector("button[type='submit']");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Creating Account...";
  submitBtn.disabled = true;

  try {
    await addDatabaseUser({ name, email, phone, registeredAt: new Date().toISOString() });
    showNotification("Registration Successful! Your details are saved in the database.", "success");
    form.reset();
  } catch (error) {
    showNotification("Registration failed. Please try again.", "error");
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach(notification => notification.remove());

  // Create new notification
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Style the notification
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "16px 24px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "500",
    zIndex: "10000",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    animation: "slideInRight 0.3s ease-out"
  });

  // Set background color based on type
  if (type === "success") {
    notification.style.backgroundColor = "#1e3a8a";
  } else if (type === "error") {
    notification.style.backgroundColor = "#1e3a8a";
    notification.style.opacity = "0.9";
  } else {
    notification.style.backgroundColor = "#1e3a8a";
  }

  document.body.appendChild(notification);

  // Add slide in animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-in";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);

  // Add slide out animation
  style.textContent += `
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
}

async function submitAdminLogin(event) {
  event.preventDefault();
  const username = document.getElementById("admin-username").value.trim();
  const password = document.getElementById("admin-password").value.trim();
  const message = document.getElementById("admin-message");

  try {
    const response = await fetch(API_ADMIN_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      message.textContent = "Invalid admin credentials.";
      return;
    }

    await showAdminDashboard(true);
  } catch (error) {
    console.error("Admin login failed:", error);
    message.textContent = "Unable to login. Please try again later.";
  }
}

function logoutAdmin() {
  showAdminDashboard(false);
}

window.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const adminForm = document.getElementById("admin-form");
  const logoutButton = document.getElementById("admin-logout");
  const searchInput = document.getElementById("searchInput");

  if (registerForm) {
    registerForm.addEventListener("submit", submitRegisterForm);
  }
  if (adminForm) {
    adminForm.addEventListener("submit", submitAdminLogin);
  }
  if (logoutButton) {
    logoutButton.addEventListener("click", logoutAdmin);
  }

  // Search functionality
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        renderAdminUsers(this.value);
      }, 300);
    });
  }

  showAdminDashboard(false);

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const navHeight = document.querySelector('nav').offsetHeight;
        const targetPosition = targetSection.offsetTop - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinksContainer = document.querySelector('.nav-links');

  if (mobileMenuToggle && navLinksContainer) {
    mobileMenuToggle.addEventListener('click', function() {
      navLinksContainer.classList.toggle('mobile-menu-open');
      this.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!navLinksContainer.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      navLinksContainer.classList.remove('mobile-menu-open');
      mobileMenuToggle.classList.remove('active');
    }
  });

  // FAQ Accordion functionality
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', function() {
      // Close all other FAQ items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current item
      item.classList.toggle('active');
    });
  });
});
