# Database Restore Instructions

To restore the MongoDB database on your new machine:

1.  **Install MongoDB**: Ensure MongoDB is installed and running on your system.
2.  **Restore Data**: Run the following command from the root of this repository:

    ```bash
    mongorestore --uri="mongodb://localhost:27017" db_backup
    ```

This will restore the `streetsmart` database with all its collections (users, properties, bookings, etc.).
