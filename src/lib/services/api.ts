// Unified API Client for VERIFEX AI Frontend

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith("/") ? endpoint : `/api/${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[fetchApi] Error calling ${url}:`, error);
    throw error;
  }
}

// 1. Shipment Service
export const shipmentService = {
  async getShipments(params?: { category?: string; status?: string; search?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ success: boolean; shipments: any[] }>(`/api/shipments?${query}`);
  },
  async getShipment(id: string) {
    return fetchApi<{ success: boolean; shipment: any }>(`/api/shipments/${id}`);
  },
  async createShipment(data: any) {
    return fetchApi<{ success: boolean; shipment: any }>(`/api/shipments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// 2. Document Service
export const documentService = {
  async getDocuments(shipmentId: string) {
    return fetchApi<{ success: boolean; documents: any[] }>(`/api/shipments/${shipmentId}/documents`);
  },
  async uploadDocuments(shipmentId: string, files: File[]) {
    const formData = new FormData();
    for (const f of files) {
      formData.append("files", f);
    }
    const res = await fetch(`/api/shipments/${shipmentId}/documents`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return (await res.json()) as { success: boolean; documents: any[] };
  },
  async processDocument(docId: string) {
    return fetchApi<{ success: boolean; document: any; extracted_fields: any[] }>(`/api/documents/${docId}/process`, {
      method: "POST",
    });
  },
};

// 3. Verification Service
export const verificationService = {
  async getResults(shipmentId: string) {
    return fetchApi<any>(`/api/shipments/${shipmentId}/results`);
  },
  async getGoldenRecord(shipmentId: string) {
    return fetchApi<{ success: boolean; golden_record: any[] }>(`/api/shipments/${shipmentId}/golden-record`);
  },
  async overrideGoldenField(shipmentId: string, fieldId: string, value: string) {
    return fetchApi<any>(`/api/shipments/${shipmentId}/golden-record/${fieldId}`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    });
  },
  async resolveDiscrepancy(discrepancyId: string, resolvedBy: string = "Alwin Joseph") {
    return fetchApi<any>(`/api/discrepancies/${discrepancyId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolved_by: resolvedBy }),
    });
  },
  async reverify(shipmentId: string) {
    return fetchApi<any>(`/api/shipments/${shipmentId}/reverify`, {
      method: "POST",
    });
  },
  async getReadiness(shipmentId: string) {
    return fetchApi<any>(`/api/shipments/${shipmentId}/readiness`);
  },
  async getCustomsRisk(shipmentId: string) {
    return fetchApi<any>(`/api/shipments/${shipmentId}/customs-risk`, {
      method: "POST",
    });
  },
  async getReport(shipmentId: string) {
    return fetchApi<any>(`/api/shipments/${shipmentId}/report`, {
      method: "POST",
    });
  },
  async getVerifiedQR(shipmentId: string) {
    return fetchApi<any>(`/api/shipments/${shipmentId}/qr`, {
      method: "POST",
    });
  },
};

// 4. Assistant Service
export const assistantService = {
  async askQuestion(shipmentId: string, question: string) {
    return fetchApi<{ success: boolean; answer: string; citations: string[] }>(`/api/shipments/${shipmentId}/assistant`, {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  },
};

// 5. Insights & Public Verify Service
export const insightsService = {
  async getInsights() {
    return fetchApi<any>(`/api/insights`);
  },
  async getPublicVerify(token: string) {
    return fetchApi<any>(`/api/verify-status/${token}`);
  },
};
