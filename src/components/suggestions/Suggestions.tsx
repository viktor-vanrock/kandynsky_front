import { Button } from '@salutejs/plasma-giga';
import { FC } from 'react';
import styled from 'styled-components';
import { getLocalizedSuggestions } from '../../utils/const';
import { useLocale } from '../../context';

const SuggestionsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  justify-content: center;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
`;

interface SuggestionsProps {
  isMobile: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

export const Suggestions: FC<SuggestionsProps> = ({ isMobile, onSuggestionClick }) => {
  const { t } = useLocale();
  const suggestions = getLocalizedSuggestions(t);
  const displayedSuggestions = suggestions.slice(0, isMobile ? 3 : suggestions.length);

  return (
    <SuggestionsWrapper>
      {displayedSuggestions.map((suggestion, index) => (
        <Button text={suggestion} size="s" view="dark" key={index} onClick={() => onSuggestionClick(suggestion)} />
      ))}
    </SuggestionsWrapper>
  );
};
