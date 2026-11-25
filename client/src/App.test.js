import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import api from './api/axios';

jest.mock('./api/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const products = [
  { _id: 'p1', name: 'Wireless Mouse', description: 'Ergonomic mouse', price: 799, stock: 12, image: 'mouse.jpg' },
  { _id: 'p2', name: 'USB-C Hub', description: '7-in-1 hub', price: 1999, stock: 0, image: 'hub.jpg' },
];

const mockBackend = ({ user } = {}) => {
  api.get.mockImplementation((url) => {
    if (url === '/auth/profile') {
      return user ? Promise.resolve({ data: user }) : Promise.reject(new Error('401'));
    }
    if (url === '/products') return Promise.resolve({ data: products });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
  api.post.mockResolvedValue({ data: {} });
};

const renderApp = () =>
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

beforeEach(() => {
  window.history.pushState({}, '', '/');
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test('guests see login/register links and the product catalogue', async () => {
  mockBackend();
  renderApp();

  expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
  expect(screen.getByText('₹799')).toBeInTheDocument();
});

test('out-of-stock products cannot be added to the cart', async () => {
  mockBackend();
  renderApp();

  await screen.findByText('USB-C Hub');
  const [inStock, outOfStock] = screen.getAllByRole('button', { name: 'Add to Cart' });
  expect(inStock).toBeEnabled();
  expect(outOfStock).toBeDisabled();
  expect(screen.getByText('Out of Stock')).toBeInTheDocument();
});

test('guests are asked to log in before adding to the cart', async () => {
  mockBackend();
  renderApp();

  await screen.findByText('Wireless Mouse');
  fireEvent.click(screen.getAllByRole('button', { name: 'Add to Cart' })[0]);
  expect(window.alert).toHaveBeenCalledWith('Please login first');
  expect(api.post).not.toHaveBeenCalledWith('/cart', expect.anything());
});

test('logged-in users get a greeting, account links and can add to the cart', async () => {
  mockBackend({ user: { name: 'Jayant', role: 'user' } });
  renderApp();

  expect(await screen.findByText('Hello, Jayant')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Cart' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'My Orders' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();

  await screen.findByText('Wireless Mouse');
  fireEvent.click(screen.getAllByRole('button', { name: 'Add to Cart' })[0]);
  expect(api.post).toHaveBeenCalledWith('/cart', { productId: 'p1', quantity: 1 });
});
