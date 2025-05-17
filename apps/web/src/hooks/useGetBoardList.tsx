import { useEffect, useState } from "react";

/**
 * Board type returned from the API
 */
export interface Board {
  id: string;
  name: string;
}

/**
 * Hook to fetch board list from the API
 * @returns {Object} Object containing boards data, loading state, and error state
 */
export const useGetBoardList = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5005/api/board");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setBoards(data);
        setError(null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  return { boards, loading, error };
};
