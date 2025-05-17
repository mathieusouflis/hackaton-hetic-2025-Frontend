import { useEffect, useState } from "react";

/**
 * Card type returned from the API
 */
export interface Card {
  id: string;
  title: string | null;
  url: string;
  domain: string;
  text: string;
  img: string;
  note: string;
  board_name: string;
  tags: string[];
  resume_information: string;
}

/**
 * Hook to fetch a board and its cards from the API
 * @returns {Object} Object containing cards data, loading state, and error state
 */
export const useGetBoard = (boardName: string) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5005/api/boards/${boardName}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setCards(data.cards ?? []); // Extract cards array
        setError(null);
      } catch (err) {
        setError(err as Error);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardName]);

  return { cards, loading, error };
};
