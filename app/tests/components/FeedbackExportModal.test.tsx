import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertProvider } from 'components/common/Alert/AlertProvider';
import FeedbackExportModal from 'components/FeedbackExportModal';
import UserProvider from 'contexts/user';
import { adminUser } from 'mockData/users';
import { PeriodOption } from 'types/date';
import { toStandardDateFormat } from 'utils/date';

const mockGetCurrentDateString = jest.fn();

global.fetch = jest.fn();
global.window.URL.createObjectURL = jest.fn(() => 'http://some_url_to_the_csv_file.com');
HTMLAnchorElement.prototype.click = jest.fn();

jest.mock('utils/date', () => ({
  getCurrentDateString: () => mockGetCurrentDateString(),
  toStandardDateFormat: jest.fn(),
}));

const mockFetch = fetch as jest.Mock;

describe('The FeedbackExportModal component', () => {
  const user = userEvent.setup();
  const periodOptions: PeriodOption[] = [
    { label: `S1`, key: 's1', range: { start: new Date(), end: new Date() } },
  ];
  const closeModal = jest.fn();

  const ModalComponent = (
    <UserProvider user={adminUser}>
      <AlertProvider>
        <FeedbackExportModal periodOptions={periodOptions} closeModal={closeModal} />
      </AlertProvider>
    </UserProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display the modal title', () => {
    render(ModalComponent);
    expect(screen.getByText('Exporter les feedbacks')).toBeInTheDocument();
  });

  it('should display the period selector as an admin user', () => {
    render(ModalComponent);
    expect(screen.getByText('Sélectionner une période')).toBeInTheDocument();
  });

  it('should display a disabled "Exporter" button by default', () => {
    render(ModalComponent);
    expect(screen.getByText('Exporter')).toBeDisabled();
  });

  it('should enable the "Exporter" button when filling all required fields', async () => {
    render(ModalComponent);
    await user.click(screen.getByText('Sélectionner une période'));
    await user.click(await screen.findByText(periodOptions[0].label));

    expect(screen.getByText('Exporter')).toBeEnabled();
  });

  it('should download a CSV file when clicking on "Exporter"', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Disposition': `attachment; filename="test.csv"` }),
      blob: () => Promise.resolve(new Blob(['some;csv;content'])),
    });

    render(ModalComponent);
    await user.click(screen.getByText('Sélectionner une période'));
    await user.click(await screen.findByText(periodOptions[0].label));

    await act(() => user.click(screen.getByText('Exporter')));

    const { start, end } = periodOptions[0].range;

    expect(mockFetch).toHaveBeenCalledWith('/api/feedbacks/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: toStandardDateFormat(start),
        end: toStandardDateFormat(end),
      }),
    });

    const downloadLink = screen.getByTestId('feedbacks-downloader') as HTMLAnchorElement;
    const downloadClick = jest.spyOn(downloadLink, 'click');
    expect(downloadLink).toHaveAttribute('href', 'http://some_url_to_the_csv_file.com');
    expect(downloadLink).toHaveAttribute('download');
    expect(downloadClick).toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalled();

    expect(await screen.findByText("L'export a été réalisé avec succès.")).toBeInTheDocument();
  });
});
