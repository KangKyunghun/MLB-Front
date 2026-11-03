'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPostForEdit } from '@/lib/api/community';
import { PostResponse } from '@/types/community';
import PostForm from '@/components/community/PostForm';

export default function EditPage() {
  const { postId } = useParams<{ postId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // getPostForEdit: 조회수 증가 없는 수정용 API
        const data = await getPostForEdit(Number(postId));
        setPost(data);
      } catch {
        router.replace('/community');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  if (!post) return null;

  return <PostForm post={post} />;
}