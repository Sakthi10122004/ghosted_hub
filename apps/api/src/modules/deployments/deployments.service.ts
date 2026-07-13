import { Injectable } from '@nestjs/common';

@Injectable()
export class DeploymentsService {
  findAll() {
    const mockDeployments = [
      { id: "1", serialNumber: "GH-001", orgName: "Riverbend Youth Alliance", portNumber: "2368", cname: "riverbend.ghosted.org", stagingUrl: "https://staging-riverbend.ghosted.org", dns: "CNAME → ghosted.org", mappedStatus: "Mapped", note: "Live since Cohort 7", email: "riverbend@ghosted.org", appPassword: "rba-x4k9m2p7", siteAdminPassword: "Rb#2026$Admin" },
      { id: "2", serialNumber: "GH-002", orgName: "Harbor Literacy Project", portNumber: "2369", cname: "harbor.ghosted.org", stagingUrl: "https://staging-harbor.ghosted.org", dns: "CNAME → ghosted.org", mappedStatus: "Mapped", note: "Content migration complete", email: "harbor@ghosted.org", appPassword: "hlp-j8n3q5v1", siteAdminPassword: "Hl#2026$Admin" },
      { id: "3", serialNumber: "GH-003", orgName: "Cascade Wildlife Trust", portNumber: "2370", cname: "cascade.ghosted.org", stagingUrl: "https://staging-cascade.ghosted.org", dns: "A Record pending", mappedStatus: "Pending", note: "DNS propagation in progress", email: "cascade@ghosted.org", appPassword: "cwt-m2b7k9x4", siteAdminPassword: "Cw#2026$Admin" },
    ];
    return { data: mockDeployments };
  }
}
