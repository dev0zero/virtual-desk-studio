import { Folder } from '@/types/desktop';

// URL вашего PHP бэкенда
const API_BASE_URL = 'https://your-backend-url.com/api';

export interface BackendFolder extends Folder {
  // Дополнительные поля от бэкенда, если нужны
}

/**
 * Загрузить все папки и файлы с бэкенда
 */
export const loadFoldersFromBackend = async (): Promise<Folder[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Добавьте Authorization если нужна авторизация
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.folders || [];
  } catch (error) {
    console.error('Ошибка загрузки папок:', error);
    // Вернуть дефолтные папки в случае ошибки
    return getDefaultFolders();
  }
};

/**
 * Сохранить папки на бэкенд
 */
export const saveFoldersToBackend = async (folders: Folder[]): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ folders }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Ошибка сохранения папок:', error);
    return false;
  }
};

/**
 * Дефолтные папки (если бэкенд недоступен)
 */
function getDefaultFolders(): Folder[] {
  return [
    { id: '1', name: 'Документы', position: { x: 50, y: 50 }, files: [], subFolders: [] },
    { id: '2', name: 'Картинки', position: { x: 50, y: 180 }, files: [], subFolders: [] },
    { id: '3', name: 'Музыка', position: { x: 50, y: 310 }, files: [], subFolders: [] },
    { id: 'trash', name: 'Корзина', position: { x: 50, y: 440 }, files: [], subFolders: [], isTrash: true },
  ];
}

/* 
ПРИМЕР СТРУКТУРЫ ДАННЫХ ОТ БЭКЕНДА:

PHP должен возвращать JSON такого формата:

{
  "folders": [
    {
      "id": "1",
      "name": "Документы",
      "position": { "x": 50, "y": 50 },
      "files": [
        {
          "id": "file1",
          "name": "document.pdf",
          "type": "application/pdf",
          "size": 1024000,
          "url": "https://your-backend.com/files/document.pdf",
          "position": { "x": 30, "y": 30 }
        }
      ],
      "subFolders": [
        {
          "id": "sub1",
          "name": "Подпапка",
          "position": { "x": 150, "y": 30 },
          "files": [],
          "subFolders": []
        }
      ]
    },
    {
      "id": "2",
      "name": "Картинки",
      "position": { "x": 50, "y": 180 },
      "files": [
        {
          "id": "img1",
          "name": "photo.jpg",
          "type": "image/jpeg",
          "size": 2048000,
          "url": "https://your-backend.com/files/photo.jpg",
          "position": { "x": 30, "y": 30 }
        }
      ],
      "subFolders": []
    }
  ]
}

ПРИМЕР PHP КОДА (api/folders.php):

<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Подключение к БД
$db = new PDO('mysql:host=localhost;dbname=your_db', 'username', 'password');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Загрузить папки из БД
    $stmt = $db->query('SELECT * FROM folders');
    $folders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Загрузить файлы для каждой папки
    foreach ($folders as &$folder) {
        $stmt = $db->prepare('SELECT * FROM files WHERE folder_id = ?');
        $stmt->execute([$folder['id']]);
        $folder['files'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Декодировать JSON поля
        $folder['position'] = json_decode($folder['position'], true);
        foreach ($folder['files'] as &$file) {
            $file['position'] = json_decode($file['position'], true);
        }
    }
    
    echo json_encode(['folders' => $folders]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Сохранить папки в БД
    $input = json_decode(file_get_contents('php://input'), true);
    $folders = $input['folders'];
    
    // Очистить старые данные
    $db->exec('DELETE FROM folders');
    $db->exec('DELETE FROM files');
    
    // Сохранить новые данные
    foreach ($folders as $folder) {
        $stmt = $db->prepare('INSERT INTO folders (id, name, position) VALUES (?, ?, ?)');
        $stmt->execute([
            $folder['id'],
            $folder['name'],
            json_encode($folder['position'])
        ]);
        
        if (isset($folder['files'])) {
            foreach ($folder['files'] as $file) {
                $stmt = $db->prepare('INSERT INTO files (id, folder_id, name, type, size, url, position) VALUES (?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([
                    $file['id'],
                    $folder['id'],
                    $file['name'],
                    $file['type'],
                    $file['size'],
                    $file['url'] ?? null,
                    json_encode($file['position'])
                ]);
            }
        }
    }
    
    echo json_encode(['success' => true]);
}
?>
*/
