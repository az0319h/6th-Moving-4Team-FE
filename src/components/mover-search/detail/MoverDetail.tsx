// src/components/mover-search/detail/MoverDetail.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Mover } from '@/lib/types/mover.types';
import { getMoverById } from '@/lib/actions/mover.action';
import ActionButtons from './ActionButtons';
import MainMoverCard from './MainMoverCard';
import DetailSections from './DetailSections';
import ShareSection from './ShareSection';
import MoverProfile from '@/components/common/profile/MoverProfile';
//import MoverProfileclient from '@/components/my-quotes/common/MoverProfileClient';
import Line from './Line';

export default function MoverDetailPage() {
  const params = useParams();
  
  // 목데이터 - 디자인 테스트용
  // const mockMover: Mover = {
  //   id: '1',
  //   profileImage: '/default-profile.png',
  //   nickName: '김기사',
  //   favoriteCount: 127,
  //   averageReviewRating: 4.8,
  //   reviewCount: 89,
  //   career: 8,
  //   estimateCount: 234,
  //   serviceType: ['SMALL', 'HOME', 'OFFICE'],
  //   region: ['서울특별시', '경기도', '인천광역시'],
  //   description: '안녕하세요! 8년 경력의 김기사입니다.\n\n고객님의 소중한 물건을 안전하고 신속하게 운송해드리겠습니다.\n- 소형이사, 가정이사, 사무실이사 전문\n- 포장재 무료 제공\n- 24시간 상담 가능\n- 손해보험 가입 완료\n\n믿고 맡겨주세요!',
  //   isFavorite: false,
  // };

  // const [mover] = useState<Mover>(mockMover);

  // API 호출 부분 주석 처리
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mover, setMover] = useState<Mover | null>(null);


  useEffect(() => {
    const fetchMover = async () => {
      try {
        setLoading(true);
        const id = params.id as string;
        const moverData = await getMoverById(id);
        setMover(moverData);
      } catch (err) {
        console.error('Error fetching mover:', err);
        setError('기사님 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMover();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !mover) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error || '기사님 정보를 찾을 수 없습니다.'}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-4 lg:gap-6">
      {/* Mobile Layout - Stack vertically */}
      <div className="flex flex-col lg:hidden gap-4">
        <MainMoverCard mover={mover}/>
        <Line/>
        <ShareSection/>
        <DetailSections mover={mover} />
        <ActionButtons mover={mover} />
      </div>

      {/* Desktop Layout - Side by side */}
      <div className="hidden lg:flex lg:flex-row lg:justify-between lg:gap-6">
        <div className="flex flex-col gap-6 w-full lg:w-2/3">
          <MainMoverCard mover={mover}/>
          <Line/>
          <DetailSections mover={mover} />
        </div>
        
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <ActionButtons mover={mover} />
          <div className='hidden lg:block'><Line/></div>
          <ShareSection />
        </div>
      </div>
    </div>
  );
}





