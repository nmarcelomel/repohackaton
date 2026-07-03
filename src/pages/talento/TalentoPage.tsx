import { ExpertSearch } from './components/ExpertSearch';
import { GrowthRadar } from './components/GrowthRadar';
import { SkillGapAnalysis } from './components/SkillGapAnalysis';
import { TechMasterRanking } from './components/TechMasterRanking';
import { TechRewards } from './components/TechRewards';
import { Communities } from './components/Communities';

export function TalentoPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Talento</h2>

      <ExpertSearch />
      <GrowthRadar />
      <SkillGapAnalysis />
      <TechMasterRanking />
      <TechRewards />
      <Communities />
    </div>
  );
}
