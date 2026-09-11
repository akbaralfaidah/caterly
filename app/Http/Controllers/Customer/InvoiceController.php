<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Customer/Invoices');
    }
}