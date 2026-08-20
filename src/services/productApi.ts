export type PostItem = {
    id: number;
    title: string;
    body: string;
  };
  
  export async function fetchSamplePosts(): Promise<PostItem[]> {
    const res = await fetch(
      'https://jsonplaceholder.typicode.com/posts?_limit=10',
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  }