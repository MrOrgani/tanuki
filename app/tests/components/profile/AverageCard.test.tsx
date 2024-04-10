import { render, screen } from '@testing-library/react';
import AverageCard from 'components/profile/AverageCard';
import { manyFeedbacks } from 'mockData/feedbacks';
import { formatDecimalNumber } from 'utils';

describe('The AverageCard component in the profile page', () => {
  const AverageCardComponent = <AverageCard feedbacks={manyFeedbacks} />;
  it('should display the average card title', () => {
    render(AverageCardComponent);
    expect(screen.getByRole('heading', { level: 3, name: 'NPS Moyen' })).toBeInTheDocument();
  });

  it('should display the average card with the correct data', () => {
    const feedbacks = [manyFeedbacks[0], manyFeedbacks[1]];
    const average =
      feedbacks.reduce((acc, feedback) => acc + feedback.answers.grade, 0) / feedbacks.length;

    render(<AverageCard feedbacks={feedbacks} />);

    expect(screen.getByText(`${formatDecimalNumber(average)}/10`)).toBeInTheDocument();
  });
});
