"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface ClaimRequest {
  id: string;
  player: {
    firstName: string;
    lastName: string;
    schoolName?: string;
    sport?: string;
  };
  requestedEmail: string;
  requestedBy: string;
  verificationInfo: {
    phone?: string;
    graduationYear?: string;
    jerseyNumber?: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

// Placeholder data
const mockClaims: ClaimRequest[] = [];

export default function PlayerClaimsPage() {
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async (claimId: string) => {
    // TODO: Call API to approve claim
    console.log("Approving claim:", claimId);
  };

  const handleReject = async (claimId: string, reason: string) => {
    // TODO: Call API to reject claim
    console.log("Rejecting claim:", claimId, "Reason:", reason);
  };

  const pendingClaims = mockClaims.filter((c) => c.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Player Claim Requests
        </h1>
        <p className="text-sm text-muted mt-1">
          Review and approve player profile claims
        </p>
      </div>

      {/* Claims list */}
      {pendingClaims.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-lg font-display font-bold text-foreground">
            No Pending Claims
          </h2>
          <p className="text-sm text-muted mt-2">
            All player claim requests have been reviewed
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-display font-bold text-foreground">
                    {claim.player.firstName} {claim.player.lastName}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="text-muted">School:</span>{" "}
                      <span className="text-foreground">
                        {claim.player.schoolName || "—"}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted">Sport:</span>{" "}
                      <span className="text-foreground">
                        {claim.player.sport || "—"}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted">Requested by:</span>{" "}
                      <span className="text-foreground">
                        {claim.requestedBy}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted">Email:</span>{" "}
                      <span className="text-foreground">
                        {claim.requestedEmail}
                      </span>
                    </p>
                  </div>

                  {/* Verification info */}
                  <div className="mt-4 p-4 bg-muted/10 rounded-md">
                    <h4 className="text-xs uppercase tracking-wide font-semibold text-secondary mb-2">
                      Verification Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      {claim.verificationInfo.phone && (
                        <p>
                          <span className="text-muted">Phone:</span>{" "}
                          <span className="text-foreground font-mono">
                            {claim.verificationInfo.phone}
                          </span>
                        </p>
                      )}
                      {claim.verificationInfo.graduationYear && (
                        <p>
                          <span className="text-muted">Grad Year:</span>{" "}
                          <span className="text-foreground font-mono">
                            {claim.verificationInfo.graduationYear}
                          </span>
                        </p>
                      )}
                      {claim.verificationInfo.jerseyNumber && (
                        <p>
                          <span className="text-muted">Jersey:</span>{" "}
                          <span className="text-foreground font-mono">
                            #{claim.verificationInfo.jerseyNumber}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setSelectedClaim(claim.id);
                      setActionType("approve");
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    onClick={() => {
                      setSelectedClaim(claim.id);
                      setActionType("reject");
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted mt-4">
                Submitted {new Date(claim.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Approve confirmation dialog */}
      <ConfirmDialog
        open={actionType === "approve" && selectedClaim !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedClaim(null);
            setActionType(null);
          }
        }}
        title="Approve Claim Request"
        description="This will create a player account and link it to the player profile. The user will receive login credentials via email."
        confirmLabel="Approve"
        onConfirm={async () => {
          if (selectedClaim) {
            await handleApprove(selectedClaim);
          }
        }}
      />

      {/* Reject dialog */}
      {actionType === "reject" && selectedClaim && (
        <ConfirmDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedClaim(null);
              setActionType(null);
              setRejectionReason("");
            }
          }}
          title="Reject Claim Request"
          description="Please provide a reason for rejecting this claim request."
          confirmLabel="Reject"
          variant="destructive"
          onConfirm={async () => {
            await handleReject(selectedClaim, rejectionReason);
            setRejectionReason("");
          }}
        />
      )}
    </div>
  );
}
