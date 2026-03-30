'use client';

import { trpc } from '@/trpc/client';
import { useState } from 'react';

export default function Home() {
  const [name, setName] = useState('World');
  const [title, setTitle] = useState('');

  const hello = trpc.example.hello.useQuery({ name });
  const items = trpc.example.getAll.useQuery();
  const createMutation = trpc.example.create.useMutation();
  const cfInfo = trpc.cloudflare.getRequestInfo.useQuery();

  const handleCreate = () => {
    if (title) {
      createMutation.mutate({ title });
      setTitle('');
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Next.js + tRPC + Cloudflare</h1>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h2>Cloudflare Status</h2>
        {cfInfo.isLoading && <p>Loading...</p>}
        {cfInfo.data && (
          <div>
            <p>Cloudflare Context: {cfInfo.data.hasCloudflareContext ? '✅ Active' : '❌ Not available (running locally)'}</p>
            {cfInfo.data.cf && (
              <div style={{ marginTop: '0.5rem' }}>
                <p>Data Center: {cfInfo.data.cf.colo}</p>
                <p>Country: {cfInfo.data.cf.country}</p>
                <p>City: {cfInfo.data.cf.city}</p>
                <p>Timezone: {cfInfo.data.cf.timezone}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Query Example</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          style={{ padding: '0.5rem', marginRight: '1rem' }}
        />
        <p>{hello.data?.greeting ?? 'Loading...'}</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Get All Items</h2>
        {items.isLoading && <p>Loading items...</p>}
        {items.data && (
          <ul>
            {items.data.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Mutation Example</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
          style={{ padding: '0.5rem', marginRight: '1rem' }}
        />
        <button
          onClick={handleCreate}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          disabled={createMutation.isPending}
        >
          Create Item
        </button>
        {createMutation.data && (
          <div style={{ marginTop: '1rem' }}>
            <p>Created: {createMutation.data.title}</p>
            <p>ID: {createMutation.data.id}</p>
          </div>
        )}
      </div>
    </main>
  );
}
