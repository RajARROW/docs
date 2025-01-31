import { set } from "lodash";
import { useState } from "react";

// Create JSDoc for useChatGPT hook
/**
 * @title useChatGPT
 * @description useChatGPT hook
 *
 * @returns {answer, generateAnswer}
 */
const useChatGPT = () => {
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * @title generateAnswer
   * @description generateAnswer function
   * @param {string} query
   * @returns {answer, generateAnswer}
   * @example
   * const { answer, generateAnswer } = useChatGPT();
   * generateAnswer("Hello");
   * console.log(answer);
   * // => "Hello"
   */
  const generateAnswer = async (query: string) => {
    try {
      setAnswer("");
      setLoading(true);

      const response = await fetch("/api/gpt-preprocess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
        }),
      });

      if (!response.ok) {
        console.error(response.statusText);
      }

      const { prompt } = await response.json();

      const answer = await fetch("/api/gpt-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = answer.body;
      if (!data) {
        return;
      }

      setLoading(false);

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setAnswer((prev) => prev + chunkValue);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return { answer, generateAnswer, loading };
};

export default useChatGPT;
