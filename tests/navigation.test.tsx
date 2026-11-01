import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Header from '../src/components/Header';
import { AppProvider } from '../src/lib/app-context';

it('renders the real header, switches language and navigates to services without a backend', async () => {
  const user = userEvent.setup();
  render(<AppProvider><MemoryRouter>
    <Header />
    <Routes><Route path="/" element={<p>Home route</p>} />
      <Route path="/leistungen" element={<p>Services route</p>} /></Routes>
  </MemoryRouter></AppProvider>);
  await user.click(screen.getByRole('button', { name: /english|sprache|language/i }));
  expect(document.documentElement.lang).toBe('en');
  await user.click(screen.getByRole('link', { name: 'Services' }));
  expect(screen.getByText('Services route')).toBeTruthy();
  expect(fetch).not.toHaveBeenCalled();
});
