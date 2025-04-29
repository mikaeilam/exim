// Persian Date and Time
        function updateDateTime() {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const today = new Date();
            const persianDate = today.toLocaleDateString('fa-IR', options);
            document.getElementById('current-date').textContent = `تاریخ: ${persianDate}`;
            
            const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
            const persianTime = today.toLocaleTimeString('fa-IR', timeOptions);
            document.getElementById('current-time').textContent = `ساعت: ${persianTime}`;
        }

        // Update time every second
        setInterval(updateDateTime, 1000);
        updateDateTime();

        // Convert numbers to Persian
        function toPersianNumbers(num) {
            if (num === undefined || num === null) return '';
            const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
            return num.toString().replace(/\d/g, x => persianDigits[x]);
        }

        // Sample data
        let entries = JSON.parse(localStorage.getItem('entries')) || [
            {
                id: 1,
                indicator: "1",
                owner: "روان گستر تات",
                client: "خضری",
                shipping: "ستاره اقیانوس بدیع",
                booking: "BK12345",
                cargoType: "روغن پایه تصفیه اول",
                cargoCount: 100,
                cargoWeight: 5000,
                packaging: "فلکسی تانک",
                containerCount: 2,
                containerType: "20فوت",
                cottage: "CT567",
                warehouse: "WH789",
                destination: "بندرعباس",
                pdfFile: null,
                createdAt: new Date(),
                status: {
                    containerLetter: true,
                    acceptance: true,
                    container: false,
                    unloading: false,
                    warehouseBill: false,
                    tally: false,
                    exit: false
                }
            }
        ];

        // Settings
        let settings = JSON.parse(localStorage.getItem('settings')) || {
            darkMode: false,
            rowsPerPage: 15
        };

        // Current page for pagination
        let currentPage = 1;

        // DOM Elements
        const entriesContainer = document.getElementById('entries-container');
        const noEntriesMessage = document.getElementById('no-entries');
        const paginationContainer = document.getElementById('pagination');
        const addBtn = document.getElementById('add-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const searchBtn = document.getElementById('search-btn');
        const themeBtn = document.getElementById('theme-btn');
        const indicatorBtn = document.getElementById('indicator-btn');
        const searchModal = document.getElementById('search-modal');
        const closeSearch = document.getElementById('close-search');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        const entryModal = document.getElementById('entry-modal');
        const detailsModal = document.getElementById('details-modal');
        const indicatorModal = document.getElementById('indicator-modal');
        const indicatorContent = document.getElementById('indicator-content');
        const entryForm = document.getElementById('entry-form');
        const modalTitle = document.getElementById('modal-title');
        const closeModal = document.getElementById('close-modal');
        const closeDetails = document.getElementById('close-details');
        const closeIndicator = document.getElementById('close-indicator');
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notification-message');
        const ownerSelect = document.getElementById('owner');
        const newOwnerInput = document.getElementById('new-owner');
        const pdfFileInput = document.getElementById('pdf-file');

        // Current entry being edited
        let currentEntryId = null;

        // Initialize the app
        function init() {
// تنظیم پروفایل
const profileInfo = document.getElementById('profile-info');
const currentUser = localStorage.getItem('currentUser');
const userFullNames = {
    'mikaeil': 'میکائیل خداکریمی',
    'mehrdad': 'مهرداد خداکریمی',
    'haniye': 'هانیه خداکریمی',
    'hossein': 'حسین مرادی'
};
if (profileInfo && currentUser && userFullNames[currentUser]) {
    profileInfo.innerHTML = `👤 ${userFullNames[currentUser]} (${currentUser})`;
}

            // Apply saved theme
            if (settings.darkMode) {
                document.body.classList.add('dark-mode');
                themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            }
            
            renderEntries();
            setupEventListeners();

const rowsPerPageSelect = document.getElementById('rows-per-page');
if (rowsPerPageSelect) {
    rowsPerPageSelect.value = settings.rowsPerPage;
    rowsPerPageSelect.addEventListener('change', (e) => {
        settings.rowsPerPage = parseInt(e.target.value);
        currentPage = 1;
        saveToLocalStorage();
        renderEntries();
    });
}

            
            // Add beforeunload event for exit confirmation
            window.addEventListener('beforeunload', (e) => {
                saveToLocalStorage();
                if (!confirm('آیا مطمئن هستید که می‌خواهید از برنامه خارج شوید؟ تغییرات ذخیره خواهد شد.')) {
                    e.preventDefault();
                    e.returnValue = '';
                }
            });
        }

        // Save data to localStorage
        function saveToLocalStorage() {
            localStorage.setItem('entries', JSON.stringify(entries));
            localStorage.setItem('settings', JSON.stringify(settings));
        }

        // Render all entries with pagination
        function renderEntries(filterText = '') {
            entriesContainer.innerHTML = '';
            
            const filteredEntries = entries.filter(entry => {
                if (!filterText) return true;
                const searchStr = filterText.toLowerCase();
                return (
                    entry.indicator.toLowerCase().includes(searchStr) ||
                    entry.owner.toLowerCase().includes(searchStr) ||
                    entry.client.toLowerCase().includes(searchStr) ||
                    (entry.shipping && entry.shipping.toLowerCase().includes(searchStr)) ||
                    (entry.booking && entry.booking.toLowerCase().includes(searchStr)) ||
                    (entry.cargoType && entry.cargoType.toLowerCase().includes(searchStr))
                );
            });
            
            // Filter out completed entries for main view
            const mainViewEntries = filteredEntries.filter(entry => !isEntryCompleted(entry));
            
            if (mainViewEntries.length === 0) {
                entriesContainer.parentNode.classList.add('hidden');
                noEntriesMessage.classList.remove('hidden');
                renderPagination(1, 0);
                return;
            }
            
            noEntriesMessage.classList.add('hidden');
            entriesContainer.parentNode.classList.remove('hidden');
            
            // Calculate pagination
            const totalPages = Math.ceil(mainViewEntries.length / settings.rowsPerPage);
            currentPage = Math.min(currentPage, totalPages);
            
            const startIndex = (currentPage - 1) * settings.rowsPerPage;
            const endIndex = Math.min(startIndex + settings.rowsPerPage, mainViewEntries.length);
            const paginatedEntries = mainViewEntries.slice(startIndex, endIndex);
            
            paginatedEntries.forEach(entry => {
                const entryElement = createEntryRow(entry);
                entriesContainer.appendChild(entryElement);
            });
            
            renderPagination(currentPage, totalPages);
        }

        // Create table row for entry
        function createEntryRow(entry) {
            const row = document.createElement('tr');
            row.dataset.id = entry.id;
            
            // Status items
            const statusItems = [
                { id: 'containerLetter', label: 'نامه کانتینر' },
                { id: 'acceptance', label: 'پذیرش' },
                { id: 'container', label: 'کانتینر' },
                { id: 'unloading', label: 'تخلیه' },
                { id: 'warehouseBill', label: 'قبض انبار' },
                { id: 'tally', label: 'تالی' },
                { id: 'exit', label: 'خروج' }
            ];
            
            // Filter out completed status items
            const visibleStatusItems = statusItems.filter(item => !entry.status[item.id]);
            
            let statusHTML = visibleStatusItems.map(item => {
                return `
                    <div class="status-item" data-status="${item.id}" data-entry="${entry.id}">
                        ${item.label}
                    </div>
                `;
            }).join('');
            
            // PDF icon if exists
            const pdfIcon = entry.pdfFile ? 
                `<span class="action-icon pdf" data-id="${entry.id}" title="مشاهده PDF">
                    <i class="fas fa-file-pdf"></i>
                </span>` : '';
            
            row.innerHTML = `
                <td class="entry-indicator">${toPersianNumbers(entry.indicator)}</td>
                <td>${entry.owner}</td>
                <td>${entry.client}</td>
                <td>
                    <div class="status-container">
                        ${statusHTML}
                    </div>
                </td>
                <td>
                    <div class="action-icons">
                        ${pdfIcon}
                        <span class="action-icon view" data-id="${entry.id}" title="مشاهده">
                            <i class="fas fa-eye"></i>
                        </span>
                        <span class="action-icon edit" data-id="${entry.id}" title="ویرایش">
                            <i class="fas fa-edit"></i>
                        </span>
                        <span class="action-icon delete" data-id="${entry.id}" title="حذف">
                            <i class="fas fa-trash"></i>
                        </span>
                    </div>
                </td>
            `;
            
            return row;
        }

        // Render pagination buttons
        function renderPagination(currentPage, totalPages) {
            if (totalPages <= 1) {
                paginationContainer.innerHTML = '';
                return;
            }
            
            let paginationHTML = '';
            
            // Previous button
            paginationHTML += `
                <button class="page-btn" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>
                    قبلی
                </button>
            `;
            
            // Page buttons
            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `
                    <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                        ${toPersianNumbers(i)}
                    </button>
                `;
            }
            
            // Next button
            paginationHTML += `
                <button class="page-btn" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>
                    بعدی
                </button>
            `;
            
            paginationContainer.innerHTML = paginationHTML;
            
            // Add event listeners
            document.querySelectorAll('.page-btn:not(#prev-page):not(#next-page)').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentPage = parseInt(btn.dataset.page);
                    renderEntries();
                });
            });
            
            document.getElementById('prev-page')?.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderEntries();
                }
            });
            
            document.getElementById('next-page')?.addEventListener('click', () => {
                const totalPages = Math.ceil(entries.filter(entry => !isEntryCompleted(entry)).length / settings.rowsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderEntries();
                }
            });
        }

        // Render indicator entries
        function renderIndicatorEntries() {
            indicatorContent.innerHTML = '';
            
            const completedEntries = entries.filter(entry => isEntryCompleted(entry));
            
            if (completedEntries.length === 0) {
                indicatorContent.innerHTML = `
                    <div class="no-entries">
                        هیچ سند تکمیل شده‌ای وجود ندارد
                    </div>
                `;
                return;
            }
            
            const table = document.createElement('table');
            table.className = 'entries-table';
            
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>ردیف اندیکاتور</th>
                    <th>صاحب کالا</th>
                    <th>مشتری</th>
                    <th>عملیات</th>
                </tr>
            `;
            table.appendChild(thead);
            
            const tbody = document.createElement('tbody');
            
            completedEntries.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="entry-indicator">${toPersianNumbers(entry.indicator)}</td>
                    <td>${entry.owner}</td>
                    <td>${entry.client}</td>
                    <td>
                        <div class="action-icons">
                            <span class="action-icon view" data-id="${entry.id}" title="مشاهده">
                                <i class="fas fa-eye"></i>
                            </span>
                            <span class="action-icon edit" data-id="${entry.id}" title="ویرایش">
                                <i class="fas fa-edit"></i>
                            </span>
                            <span class="action-icon delete" data-id="${entry.id}" title="حذف">
                                <i class="fas fa-trash"></i>
                            </span>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            indicatorContent.appendChild(table);
        }

        // Check if all statuses are completed
        function isEntryCompleted(entry) {
            const statuses = entry.status;
            return (
                statuses.containerLetter &&
                statuses.acceptance &&
                statuses.container &&
                statuses.unloading &&
                statuses.warehouseBill &&
                statuses.tally &&
                statuses.exit
            );
        }

        // Show modal for adding/editing an entry
        function showEntryModal(entry = null) {
            if (entry) {
                modalTitle.textContent = 'ویرایش ردیف';
                currentEntryId = entry.id;
                
                // Fill the form with entry data
                document.getElementById('entry-id').value = entry.id;
                document.getElementById('indicator').value = entry.indicator;
                document.getElementById('owner').value = entry.owner;
                document.getElementById('client').value = entry.client;
                document.getElementById('shipping').value = entry.shipping || '';
                document.getElementById('booking').value = entry.booking || '';
                document.getElementById('cargo-type').value = entry.cargoType || '';
                document.getElementById('cargo-count').value = entry.cargoCount || '';
                document.getElementById('cargo-weight').value = entry.cargoWeight || '';
                document.getElementById('packaging').value = entry.packaging || '';
                document.getElementById('container-count').value = entry.containerCount || '';
                document.getElementById('container-type').value = entry.containerType || '';
                document.getElementById('cottage').value = entry.cottage || '';
                document.getElementById('warehouse').value = entry.warehouse || '';
                document.getElementById('destination').value = entry.destination || '';
                
                newOwnerInput.style.display = 'none';
                pdfFileInput.value = '';
            } else {
                modalTitle.textContent = 'ردیف جدید';
                currentEntryId = null;
                entryForm.reset();
                newOwnerInput.style.display = 'none';
            }
            
            entryModal.style.display = 'block';
        }

        // Show details modal
        function showDetailsModal(entry) {
            const detailsContent = document.getElementById('details-content');
            
            let pdfSection = '';
            if (entry.pdfFile) {
                pdfSection = `
                    <div class="form-group">
                        <label>فایل پیوست:</label>
                        <p>
                            <a href="#" id="view-pdf" data-id="${entry.id}" style="color: var(--primary-color);">
                                <i class="fas fa-file-pdf"></i> مشاهده PDF
                            </a>
                        </p>
                    </div>
                `;
            }
            
            detailsContent.innerHTML = `
                <div class="form-group">
                    <label>ردیف اندیکاتور:</label>
                    <p>${toPersianNumbers(entry.indicator)}</p>
                </div>
                <div class="form-group">
                    <label>صاحب کالا:</label>
                    <p>${entry.owner}</p>
                </div>
                <div class="form-group">
                    <label>مشتری:</label>
                    <p>${entry.client}</p>
                </div>
                <div class="form-group">
                    <label>کشتیرانی:</label>
                    <p>${entry.shipping || '-'}</p>
                </div>
                <div class="form-group">
                    <label>شماره بوکینگ:</label>
                    <p>${entry.booking || '-'}</p>
                </div>
                <div class="form-group">
                    <label>نوع کالا:</label>
                    <p>${entry.cargoType || '-'}</p>
                </div>
                <div class="form-group">
                    <label>تعداد کالا:</label>
                    <p>${entry.cargoCount ? toPersianNumbers(entry.cargoCount) : '-'}</p>
                </div>
                <div class="form-group">
                    <label>وزن کالا:</label>
                    <p>${entry.cargoWeight ? toPersianNumbers(entry.cargoWeight) + ' کیلوگرم' : '-'}</p>
                </div>
                <div class="form-group">
                    <label>نوع بسته بندی:</label>
                    <p>${entry.packaging || '-'}</p>
                </div>
                <div class="form-group">
                    <label>تعداد کانتینر:</label>
                    <p>${entry.containerCount ? toPersianNumbers(entry.containerCount) : '-'}</p>
                </div>
                <div class="form-group">
                    <label>نوع کانتینر:</label>
                    <p>${entry.containerType || '-'}</p>
                </div>
                <div class="form-group">
                    <label>شماره کوتاژ:</label>
                    <p>${entry.cottage || '-'}</p>
                </div>
                <div class="form-group">
                    <label>شماره قبض انبار:</label>
                    <p>${entry.warehouse || '-'}</p>
                </div>
                <div class="form-group">
                    <label>مقصد کالا:</label>
                    <p>${entry.destination || '-'}</p>
                </div>
                ${pdfSection}
            `;
            
            detailsModal.style.display = 'block';
        }

        // Save entry (add or update)
        function saveEntry(event) {
            event.preventDefault();
            
            let ownerValue = document.getElementById('owner').value;
            if (ownerValue === 'new') {
                ownerValue = document.getElementById('new-owner').value;
                if (!ownerValue) {
                    alert('لطفا نام صاحب کالای جدید را وارد کنید');
                    return;
                }
            }
            
            const formData = {
                id: currentEntryId || Date.now(),
                indicator: document.getElementById('indicator').value,
                owner: ownerValue,
                client: document.getElementById('client').value,
                shipping: document.getElementById('shipping').value,
                booking: document.getElementById('booking').value,
                cargoType: document.getElementById('cargo-type').value,
                cargoCount: document.getElementById('cargo-count').value,
                cargoWeight: document.getElementById('cargo-weight').value,
                packaging: document.getElementById('packaging').value,
                containerCount: document.getElementById('container-count').value,
                containerType: document.getElementById('container-type').value,
                cottage: document.getElementById('cottage').value,
                warehouse: document.getElementById('warehouse').value,
                destination: document.getElementById('destination').value,
                pdfFile: null,
                createdAt: new Date(),
                status: {
                    containerLetter: false,
                    acceptance: false,
                    container: false,
                    unloading: false,
                    warehouseBill: false,
                    tally: false,
                    exit: false
                }
            };
            
            // Handle PDF file upload
            if (pdfFileInput.files.length > 0) {
                const file = pdfFileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    formData.pdfFile = {
                        name: file.name,
                        data: e.target.result.split(',')[1] // Remove data URL prefix
                    };
                    
                    completeSaveEntry(formData);
                };
                
                reader.readAsDataURL(file);
            } else {
                // If editing and no new file selected, keep existing file
                if (currentEntryId) {
                    const existingEntry = entries.find(e => e.id == currentEntryId);
                    if (existingEntry && existingEntry.pdfFile) {
                        formData.pdfFile = existingEntry.pdfFile;
                    }
                }
                
                completeSaveEntry(formData);
            }
        }

        function completeSaveEntry(formData) {
            if (currentEntryId) {
                // Update existing entry
                const index = entries.findIndex(e => e.id == currentEntryId);
                if (index !== -1) {
                    // Preserve the status and creation date
                    formData.status = entries[index].status;
                    formData.createdAt = entries[index].createdAt;
                    entries[index] = formData;
                    showNotification('ردیف با موفقیت ویرایش شد');
                }
            } else {
                // Add new entry at the beginning of the array
                entries.unshift(formData);
                showNotification('ردیف جدید با موفقیت اضافه شد');
            }
            
            saveToLocalStorage();
            renderEntries();
            entryModal.style.display = 'none';
        }

        // Delete an entry
        function deleteEntry(id) {
            if (confirm('آیا از حذف این ردیف مطمئن هستید؟')) {
                entries = entries.filter(entry => entry.id != id);
                saveToLocalStorage();
                renderEntries();
                renderIndicatorEntries();
                showNotification('ردیف با موفقیت حذف شد');
            }
        }

        // Update status
        function updateStatus(entryId, statusKey) {
            const entry = entries.find(e => e.id == entryId);
            if (entry) {
                entry.status[statusKey] = true;
                saveToLocalStorage();
                
                // If entry is now completed, move it to indicator
                if (isEntryCompleted(entry)) {
                    showNotification('سند تکمیل شد و به اندیکاتور منتقل گردید');
                    renderIndicatorEntries();
                }
                
                renderEntries();
            }
        }

        // Toggle dark mode
        function toggleDarkMode() {
            settings.darkMode = !settings.darkMode;
            
            if (settings.darkMode) {
                document.body.classList.add('dark-mode');
                themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                document.body.classList.remove('dark-mode');
                themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            }
            
            saveToLocalStorage();
        }

        // Show notification
        function showNotification(message) {
            notificationMessage.textContent = message;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }

        // Search function
        function performSearch() {
            const searchTerm = searchInput.value.trim();
            if (searchTerm === '') {
                searchResults.innerHTML = '<div class="no-entries">لطفا عبارت جستجو را وارد کنید</div>';
                return;
            }
            
            const results = entries.filter(entry => {
                const searchStr = searchTerm.toLowerCase();
                return (
                    entry.indicator.toLowerCase().includes(searchStr) ||
                    entry.owner.toLowerCase().includes(searchStr) ||
                    entry.client.toLowerCase().includes(searchStr) ||
                    (entry.shipping && entry.shipping.toLowerCase().includes(searchStr)) ||
                    (entry.booking && entry.booking.toLowerCase().includes(searchStr)) ||
                    (entry.cargoType && entry.cargoType.toLowerCase().includes(searchStr))
                );
            });
            
            if (results.length === 0) {
                searchResults.innerHTML = '<div class="no-entries">هیچ نتیجه‌ای یافت نشد</div>';
                return;
            }
            
            let resultsHTML = '';
            results.forEach(entry => {
                resultsHTML += `
                    <div class="entry-item" style="margin-bottom: 10px; cursor: pointer;" data-id="${entry.id}">
                        <div class="entry-header">
                            <span class="entry-indicator">ردیف ${entry.indicator}</span>
                        </div>
                        <div class="entry-body">
                            <div class="entry-field"><strong>صاحب کالا:</strong> ${entry.owner}</div>
                            <div class="entry-field"><strong>مشتری:</strong> ${entry.client}</div>
                        </div>
                    </div>
                `;
            });
            
            searchResults.innerHTML = resultsHTML;
        }

        // View PDF file
        function viewPDF(entryId) {
            const entry = entries.find(e => e.id == entryId);
            if (entry && entry.pdfFile) {
                const pdfData = `data:application/pdf;base64,${entry.pdfFile.data}`;
                window.open(pdfData, '_blank');
            }
        }

        // Setup event listeners
        function setupEventListeners() {
            // Add button
            addBtn.addEventListener('click', () => showEntryModal());
            
            // Logout button
            logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
    
                saveToLocalStorage();
                if (confirm('آیا می‌خواهید از برنامه خارج شوید؟ تغییرات ذخیره خواهد شد.')) {
                    alert('با موفقیت خارج شدید');
                    // In a real app, you would redirect to login page
                }
            });
            
            // Theme button
            themeBtn.addEventListener('click', toggleDarkMode);
            
            // Indicator button
            indicatorBtn.addEventListener('click', () => {
                renderIndicatorEntries();
                indicatorModal.style.display = 'block';
            });
            
            // Close indicator modal
            closeIndicator.addEventListener('click', () => {
                indicatorModal.style.display = 'none';
            });
            
            // Search button
            searchBtn.addEventListener('click', () => {
                searchModal.style.display = 'block';
                searchInput.focus();
            });
            
            // Close search modal
            closeSearch.addEventListener('click', () => {
                searchModal.style.display = 'none';
            });
            
            // Search input
            searchInput.addEventListener('input', performSearch);
            
            // Owner select change
            ownerSelect.addEventListener('change', (e) => {
                if (e.target.value === 'new') {
                    newOwnerInput.style.display = 'block';
                } else {
                    newOwnerInput.style.display = 'none';
                }
            });
            
            // Close modals
            closeModal.addEventListener('click', () => entryModal.style.display = 'none');
            closeDetails.addEventListener('click', () => detailsModal.style.display = 'none');
            
            // Click outside modal to close
            window.addEventListener('click', (event) => {
                if (event.target === entryModal) {
                    entryModal.style.display = 'none';
                }
                if (event.target === detailsModal) {
                    detailsModal.style.display = 'none';
                }
                if (event.target === searchModal) {
                    searchModal.style.display = 'none';
                }
                if (event.target === indicatorModal) {
                    indicatorModal.style.display = 'none';
                }
            });
            
            // Form submission
            entryForm.addEventListener('submit', saveEntry);
            
            // Dynamic event listeners for entries
            entriesContainer.addEventListener('click', (event) => {
                const entryId = event.target.closest('[data-id]')?.dataset.id;
                if (!entryId) return;
                
                const entry = entries.find(e => e.id == entryId);
                if (!entry) return;
                
                // View details
                if (event.target.closest('.view')) {
                    showDetailsModal(entry);
                    return;
                }
                
                // Edit entry
                if (event.target.closest('.edit')) {
                    showEntryModal(entry);
                    return;
                }
                
                // Delete entry
                if (event.target.closest('.delete')) {
                    deleteEntry(entryId);
                    return;
                }
                
                // View PDF
                if (event.target.closest('.pdf')) {
                    viewPDF(entryId);
                    return;
                }
                
                // Status item click
                if (event.target.closest('.status-item')) {
                    const statusKey = event.target.closest('.status-item').dataset.status;
                    updateStatus(entryId, statusKey);
                    return;
                }
            });
            
            // Search results click
            searchResults.addEventListener('click', (event) => {
                const entryElement = event.target.closest('.entry-item');
                if (!entryElement) return;
                
                const entryId = entryElement.dataset.id;
                const entry = entries.find(e => e.id == entryId);
                if (entry) {
                    showDetailsModal(entry);
                    searchModal.style.display = 'none';
                }
            });
            
            // Indicator content click
            indicatorContent.addEventListener('click', (event) => {
                const entryId = event.target.closest('[data-id]')?.dataset.id;
                if (!entryId) return;
                
                const entry = entries.find(e => e.id == entryId);
                if (!entry) return;
                
                // View details
                if (event.target.closest('.view')) {
                    showDetailsModal(entry);
                    return;
                }
                
                // Edit entry
                if (event.target.closest('.edit')) {
                    showEntryModal(entry);
                    indicatorModal.style.display = 'none';
                    return;
                }
                
                // Delete entry
                if (event.target.closest('.delete')) {
                    deleteEntry(entryId);
                    renderIndicatorEntries();
                    return;
                }
            });
            
            // Details modal PDF click
            detailsModal.addEventListener('click', (event) => {
                if (event.target.closest('#view-pdf')) {
                    const entryId = event.target.closest('#view-pdf').dataset.id;
                    viewPDF(entryId);
                }
            });
        }

        // Initialize the app
        document.addEventListener('DOMContentLoaded', init);