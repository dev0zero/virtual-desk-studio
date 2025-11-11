# Welcome to virtual Desktop

## Project info

**URL**: https://lovable.dev/projects/9e2c2497-2bca-4599-88e8-cc2a41939183


**Use your preferred IDE**


If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Для привязки к PHP бэкенду есть несколько подходов:

1. REST API (Самый простой)
Создайте PHP API endpoints и вызывайте их через fetch:


// Пример сохранения папок на PHP бэкенд
const saveFolders = async (folders: Folder[]) => {
  const response = await fetch('https://your-domain.com/api/folders/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}` // если нужна авторизация
    },
    body: JSON.stringify({ folders })
  });
  return response.json();
};

// Загрузка папок при старте
const loadFolders = async () => {
  const response = await fetch('https://your-domain.com/api/folders/load');
  const data = await response.json();
  return data.folders;
};
2. Что нужно на PHP стороне:

// api/folders/save.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // для CORS

$data = json_decode(file_get_contents('php://input'), true);
$folders = $data['folders'];

// Сохранить в БД (MySQL/PostgreSQL)
// $pdo->prepare("INSERT INTO folders...")->execute();

echo json_encode(['success' => true]);
3. Интеграция в useDesktop hook:
Добавьте синхронизацию с бэкендом в src/hooks/useDesktop.ts
