# Caterly

Caterly is a web application built using modern technologies designed to provide a robust and efficient experience.

## Technology Stack

This project is built with a powerful, modern stack:

*   **Backend:** [Laravel 13](https://laravel.com/)
*   **Frontend:** [React 19](https://react.dev/)
*   **Integration:** [Inertia.js v3](https://inertiajs.com/)
*   **Styling:** [TailwindCSS v4](https://tailwindcss.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Language:** PHP 8.3 & TypeScript

## Requirements

Before you begin, ensure you have the following installed:

*   PHP >= 8.3
*   Composer
*   Node.js & npm (or yarn/pnpm)
*   A supported database (SQLite is used by default)

## Getting Started

Follow these steps to set up the project locally:

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd caterly
    ```

2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```

3.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```

4.  **Set up the environment:**
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

5.  **Run database migrations:**
    ```bash
    php artisan migrate
    ```

6.  **Start the development servers:**

    To run both the Laravel backend and Vite frontend development servers simultaneously, you can use the integrated command:
    ```bash
    composer run dev
    ```
    *(Alternatively, you can run `php artisan serve` and `npm run dev` in separate terminal tabs).*

## Project Structure

*   `app/` - Contains the core backend logic (Controllers, Models, etc.)
*   `resources/js/Pages/` - Contains the React components that serve as views via Inertia.js
*   `routes/` - Contains all application routes (web.php, api.php)
*   `database/` - Contains migrations, factories, and seeders

## Testing

To run the test suite:

```bash
composer run test
```

## License

This project is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
