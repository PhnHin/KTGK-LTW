const skills = [
	{
		name: 'HTML',
		level: 'Cơ bản',
		note: 'Xây dựng cấu trúc trang web'
	},
	{
		name: 'CSS',
		level: 'Cơ bản',
		note: 'Trình bày giao diện trang web'
	},
	{
		name: 'JavaScript',
		level: 'Đang học',
		note: 'Tìm hiểu tương tác trên trang web'
	}
];

const skillsTableBody = document.querySelector('#skills-table-body');
const visibleSkills = skills.filter(({ name, level, note }) => name && level && note);

const skillRows = visibleSkills.map(({ name, level, note }) => {
	const row = document.createElement('tr');

	[name, level, note].forEach((value) => {
		const cell = document.createElement('td');
		cell.textContent = value;
		row.append(cell);
	});

	return row;
});
skillsTableBody.append(...skillRows);

const themeToggle = document.querySelector('#theme-toggle');
let currentTheme = 'dark';

try {
	const savedTheme = localStorage.getItem('preferred-theme');
	if (savedTheme === 'light' || savedTheme === 'dark') {
		currentTheme = savedTheme;
	}
} catch (error) {
	console.warn('Không thể đọc tùy chọn giao diện đã lưu:', error);
}

const applyTheme = (theme) => {
	document.documentElement.dataset.theme = theme;
	themeToggle.textContent = `Giao diện: ${theme === 'dark' ? 'Tối' : 'Sáng'}`;
	themeToggle.setAttribute('aria-label', `Chuyển sang giao diện ${theme === 'dark' ? 'sáng' : 'tối'}`);
	themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
};

applyTheme(currentTheme);

themeToggle.addEventListener('click', () => {
	currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
	applyTheme(currentTheme);

	try {
		localStorage.setItem('preferred-theme', currentTheme);
	} catch (error) {
		console.error('Không thể lưu tùy chọn giao diện:', error);
	}
});

const loadProjects = async () => {
	const projectsStatus = document.querySelector('#projects-status');
	const projectsList = document.querySelector('#projects-list');

	try {
		const response = await fetch('js/data.json');
		if (!response.ok) {
			throw new Error(`Tải dữ liệu thất bại với mã HTTP ${response.status}`);
		}

		const data = await response.json();
		if (!Array.isArray(data.projects)) {
			throw new TypeError('Dữ liệu dự án phải là một mảng.');
		}

		const projectItems = data.projects.map((project) => {
			const item = document.createElement('li');
			const title = document.createElement('h4');
			const description = document.createElement('p');
			const technology = document.createElement('p');

			title.textContent = project.title;
			description.textContent = project.description;
			technology.textContent = `Công nghệ: ${project.technology}`;
			technology.className = 'project-technology';
			item.append(title, description, technology);
			return item;
		});

		projectsList.replaceChildren(...projectItems);
		projectsStatus.textContent = projectItems.length
			? `Đã tải ${projectItems.length} dự án.`
			: 'Chưa có dự án nào để hiển thị.';
	} catch (error) {
		console.error('Không thể tải danh sách dự án:', error);
		projectsStatus.textContent = 'Không tải được dữ liệu dự án. Vui lòng kiểm tra kết nối hoặc thử lại sau.';
	}
};

loadProjects();

const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('#contact-status');

contactForm.addEventListener('submit', (event) => {
	event.preventDefault();
	contactStatus.className = '';

	const formData = new FormData(contactForm);
	const name = formData.get('name').trim();
	const email = formData.get('email').trim();
	const phone = formData.get('phone').trim();
	const contactDate = formData.get('contact-date');
	const message = formData.get('message').trim();
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const phonePattern = /^[0-9+().\s-]{9,15}$/;
	let error = '';
	let invalidField = null;

	if (name.length < 2 || name.length > 50 || !/^\p{L}[\p{L}\s'-]*$/u.test(name)) {
		error = 'Họ tên cần có từ 2 đến 50 ký tự chữ hợp lệ.';
		invalidField = contactForm.elements.name;
	} else if (!emailPattern.test(email)) {
		error = 'Vui lòng nhập địa chỉ email hợp lệ.';
		invalidField = contactForm.elements.email;
	} else if (phone && (!phonePattern.test(phone) || phone.replace(/\D/g, '').length < 9)) {
		error = 'Số điện thoại cần có từ 9 đến 15 chữ số hoặc ký tự định dạng hợp lệ.';
		invalidField = contactForm.elements.phone;
	} else if (!contactDate) {
		error = 'Vui lòng chọn ngày muốn liên hệ.';
		invalidField = contactForm.elements['contact-date'];
	} else if (message.length < 10) {
		error = 'Nội dung cần có ít nhất 10 ký tự không tính khoảng trắng ở đầu và cuối.';
		invalidField = contactForm.elements.message;
	}

	if (error) {
		contactStatus.textContent = error;
		contactStatus.className = 'form-status form-status--error';
		invalidField.setAttribute('aria-invalid', 'true');
		invalidField.focus();
		return;
	}

	contactForm.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
		field.removeAttribute('aria-invalid');
	});
	contactStatus.textContent = 'Thông tin hợp lệ. Biểu mẫu đã được kiểm tra; dữ liệu chưa được gửi đến máy chủ.';
	contactStatus.className = 'form-status form-status--success';
	contactForm.reset();
});
