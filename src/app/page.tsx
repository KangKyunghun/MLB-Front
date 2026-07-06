import TodayGames from "@/components/home/TodayGames";
import PlayerRanking from "@/components/home/PlayerRanking";
import TeamStanding from "@/components/home/TeamStanding";
import WeeklySchedule from "@/components/home/WeeklySchedule";
import CommunityPreview from "@/components/home/CommunityPreview";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-3">
      <TodayGames />
      <PlayerRanking />
      <TeamStanding />
      <WeeklySchedule />
      <CommunityPreview />

      <div className="rounded-xl bg-navy px-3.5 py-3.5 text-center">
        <p className="text-[11px] text-white/50">MLB-back · 포트폴리오 프로젝트</p>
        <p className="mt-1 text-[11px] text-white/50">
          Data provided by MLB Stats API
        </p>
      </div>
    </div>
  );
}
