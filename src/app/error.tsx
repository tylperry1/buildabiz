"use client";
export default function Error({ reset }: {
    reset: () => void;
}) { return <main id="main" className="container section"><h1>Something needs another try.</h1><p>We couldn’t load this page. Your saved information is unchanged.</p><button className="button" onClick={reset}>Try again</button></main>; }
