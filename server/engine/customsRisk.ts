import { CustomsQueryItem, DiscrepancyRecord } from "../types";

export function simulateCustomsQueries(discrepancies: DiscrepancyRecord[]): {
  overallRiskScore: number;
  queries: CustomsQueryItem[];
} {
  const openIssues = discrepancies.filter((d) => d.status === "OPEN");
  const queries: CustomsQueryItem[] = [];

  let riskScore = 5; // Base minimal risk

  for (const issue of openIssues) {
    if (issue.id === "qty") {
      riskScore += 45;
      queries.push({
        id: "CQ-01",
        question:
          "Why does the Packing List indicate 1,180 cartons while the Commercial Invoice and Shipping Bill declare 1,200 cartons?",
        level: "High",
        probability: 94,
        reason:
          "Quantity mismatch between primary trade documents creates suspicion of short-landing or undeclared cargo.",
        affected_documents: ["Commercial Invoice", "Packing List", "Shipping Bill"],
        suggested_response:
          "Submit amended Packing List certifying the physical stuffing count of 1,200 cartons verified at factory gate.",
        issue_id: "qty",
      });
    } else if (issue.id === "hs") {
      riskScore += 30;
      queries.push({
        id: "CQ-02",
        question:
          "Why is tariff line 030616 declared on the Shipping Bill whereas Commercial Invoice specifies Vannamei shrimp under 030617?",
        level: "Medium",
        probability: 78,
        reason:
          "HS code discrepancy affects Duty Drawback classification and export incentive calculations under RoDTEP.",
        affected_documents: ["Shipping Bill", "Commercial Invoice"],
        suggested_response:
          "File amendment request with customs appraiser aligning the Shipping Bill to 030617 before Let Export Order.",
        issue_id: "hs",
      });
    } else if (issue.id === "cert") {
      riskScore += 15;
      queries.push({
        id: "CQ-03",
        question:
          "Is the Quality / Health Certificate valid through the voyage transit to destination port?",
        level: "Low",
        probability: 45,
        reason:
          "Certificate margin is under 14 days; transit delay could cause rejection at destination customs in Jebel Ali.",
        affected_documents: ["Quality Certificate", "Shipping Schedule"],
        suggested_response:
          "Provide endorsed renewal letter from MPEDA valid through January 2027.",
        issue_id: "cert",
      });
    }
  }

  // If no open issues, risk score is low
  if (openIssues.length === 0) {
    queries.push({
      id: "CQ-CLEAN",
      question: "All documents aligned. No high-probability customs queries projected.",
      level: "Low",
      probability: 5,
      reason: "Consistency verified across Invoice, Packing List, Shipping Bill, and Certificates.",
      affected_documents: ["All documents"],
      suggested_response: "Proceed with standard customs clearance filing.",
    });
  }

  return {
    overallRiskScore: Math.min(99, riskScore),
    queries,
  };
}
