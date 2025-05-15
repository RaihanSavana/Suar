import Navbar from '@/Layouts/Navbar';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {

    return (
        <>
            <Head title="Welcome" />
            <Navbar auth={auth.auth}></Navbar>
        </>
    );
}
