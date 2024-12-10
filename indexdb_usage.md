## React Abstraction

```typescript
export const createDatabase = (
  dbName: string,
  storeName: string,
  version: number = 1,
): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(dbName, version);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" }); // Use 'id' as the primary key
      }
    };

    request.onsuccess = (event: Event) =>
      resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event: Event) =>
      reject((event.target as IDBOpenDBRequest).error);
  });
};

export const addData = <T extends Record<string, unknown>>(
  db: IDBDatabase,
  storeName: string,
  data: T[],
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction(storeName, "readwrite");
    const store: IDBObjectStore = transaction.objectStore(storeName);

    data.forEach((item) => store.add(item));

    transaction.oncomplete = () => resolve("Data added successfully");
    transaction.onerror = (event: Event) =>
      reject((event.target as IDBTransaction).error);
  });
};

export const getAllData = <T>(
  db: IDBDatabase,
  storeName: string,
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction(storeName, "readonly");
    const store: IDBObjectStore = transaction.objectStore(storeName);

    const request: IDBRequest<T[]> = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event: Event) =>
      reject((event.target as IDBRequest).error);
  });
};

export const deleteData = (
  db: IDBDatabase,
  storeName: string,
  key: IDBValidKey,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction(storeName, "readwrite");
    const store: IDBObjectStore = transaction.objectStore(storeName);

    const request: IDBRequest = store.delete(key);

    request.onsuccess = () => resolve("Data deleted successfully");
    request.onerror = (event: Event) =>
      reject((event.target as IDBRequest).error);
  });
};
```

## React Usage

```typescript
import React, { useState, useEffect } from "react";
import { createDatabase, addData, getAllData, deleteData } from "./indexedDBUtils";

const App = () => {
  const [db, setDb] = useState(null);
  const [items, setItems] = useState([]);

  const storeName = "MyStore";
  const dbName = "MyReactAppDB";

  // Initialize Database
  useEffect(() => {
    createDatabase(dbName, storeName)
      .then((dbInstance) => {
        setDb(dbInstance);
        console.log("Database initialized:", dbInstance);
      })
      .catch((error) => console.error("Error initializing database:", error));
  }, []);

  // Fetch Data from IndexedDB
  const fetchItems = () => {
    if (!db) return;

    getAllData(db, storeName)
      .then((data) => setItems(data))
      .catch((error) => console.error("Error fetching data:", error));
  };

  // Add Item to IndexedDB
  const handleAddItem = () => {
    if (!db) return;

    const newItem = {
      id: Date.now(),
      name: `Item ${items.length + 1}`,
    };

    addData(db, storeName, [newItem])
      .then(() => {
        console.log("Item added successfully");
        fetchItems(); // Refresh items
      })
      .catch((error) => console.error("Error adding item:", error));
  };

  // Delete Item from IndexedDB
  const handleDeleteItem = (id) => {
    if (!db) return;

    deleteData(db, storeName, id)
      .then(() => {
        console.log("Item deleted successfully");
        fetchItems(); // Refresh items
      })
      .catch((error) => console.error("Error deleting item:", error));
  };

  // Fetch items when the database is initialized
  useEffect(() => {
    if (db) fetchItems();
  }, [db]);

  return (
    <div>
      <h1>React with IndexedDB</h1>
      <button onClick={handleAddItem}>Add Item</button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
```
