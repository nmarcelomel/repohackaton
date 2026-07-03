import { Users, Award } from "lucide-react";
import { getUsers, getKudos } from "../../data/data-service";

export function TalentoPage() {
 const users = getUsers();
 const kudos = getKudos();

 return (
 <div className="space-y-6">
 <div className="sb-ui-grid">
 <div className="sb-ui-col-12 sb-ui-col-lg-8">
 <article className="sb-ui-card sb-ui-card--elevated">
 <div className="sb-ui-card__content">
 <div className="flex items-center gap-2 mb-4">
 <Users className="w-5 h-5 text-bolivar-green" />
 <h3 className="sb-ui-heading-h6">Skills del Equipo</h3>
 </div>
 <div className="overflow-x-auto">
 <table className="sb-ui-table sb-ui-table--hover" style={{ width: "100%" }}>
 <thead>
 <tr>
 <th>Nombre</th>
 <th>Rol</th>
 <th>Skills</th>
 </tr>
 </thead>
 <tbody>
 {users.map((user) => (
 <tr key={user.id}>
 <td className="font-medium">{user.name}</td>
 <td>
 <span className="sb-ui-chip sb-ui-chip--primary sb-ui-chip--soft sb-ui-chip--sm">
 <span className="sb-ui-chip__label">{user.role}</span>
 </span>
 </td>
 <td>
 <div className="flex flex-wrap gap-1">
 {user.skills.map((skill) => (
 <span key={skill.name} className="sb-ui-chip sb-ui-chip--default sb-ui-chip--soft sb-ui-chip--sm">
 <span className="sb-ui-chip__label">{skill.name} ({skill.level}/5)</span>
 </span>
 ))}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </article>
 </div>
 <div className="sb-ui-col-12 sb-ui-col-lg-4">
 <article className="sb-ui-card sb-ui-card--elevated">
 <div className="sb-ui-card__content">
 <div className="flex items-center gap-2 mb-4">
 <Award className="w-5 h-5 text-bolivar-yellow" />
 <h3 className="sb-ui-heading-h6">Kudos Recientes</h3>
 </div>
 <div className="space-y-3">
 {kudos.slice(0, 4).map((kudo) => {
 const from = users.find((u) => u.id === kudo.fromUserId);
 const to = users.find((u) => u.id === kudo.toUserId);
 return (
 <div key={kudo.id} className="p-3 rounded-lg bg-bolivar-gray-bg border border-bolivar-gray-light">
 <div className="flex items-center gap-2 mb-1">
 <span className="sb-ui-chip sb-ui-chip--secondary sb-ui-chip--soft sb-ui-chip--sm">
 <span className="sb-ui-chip__label">{kudo.category}</span>
 </span>
 </div>
 <p className="sb-ui-text-caption mt-1 mb-1">{kudo.message.slice(0, 80)}...</p>
 <p className="sb-ui-text-caption" style={{ color: "var(--sb-ui-color-grayscale-base)" }}>
 De {from?.name?.split(" ")[0]} → {to?.name?.split(" ")[0]}
 </p>
 </div>
 );
 })}
 </div>
 </div>
 </article>
 </div>
 </div>
 </div>
 );
}
