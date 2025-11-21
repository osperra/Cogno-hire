type CandidateDashboardProps = {
  currentPage: string;
};

export default function CandidateDashboard({ currentPage }: CandidateDashboardProps) {
  return (
    <div>
      <h1>Candidate Dashboard</h1>
      <p>Current page: {currentPage}</p>
    </div>
  );
}
