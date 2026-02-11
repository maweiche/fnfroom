"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { CheckCircle, XCircle, GraduationCap } from "lucide-react";

interface CollegeOffer {
  id: string;
  player: {
    firstName: string;
    lastName: string;
    schoolName?: string;
  };
  collegeName: string;
  collegeDivision: string;
  offerType: string;
  sport: string;
  offerDate?: string;
  verified: boolean;
  createdAt: string;
}

// Placeholder data
const mockOffers: CollegeOffer[] = [];

export default function CollegeOffersPage() {
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"verify" | "reject" | null>(
    null
  );

  const handleVerify = async (offerId: string) => {
    // TODO: Call API to verify offer
    console.log("Verifying offer:", offerId);
  };

  const handleReject = async (offerId: string) => {
    // TODO: Call API to reject/delete offer
    console.log("Rejecting offer:", offerId);
  };

  const unverifiedOffers = mockOffers.filter((o) => !o.verified);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          College Offers
        </h1>
        <p className="text-sm text-muted mt-1">
          Review and verify player college offers
        </p>
      </div>

      {/* Offers list */}
      {unverifiedOffers.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <GraduationCap className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-lg font-display font-bold text-foreground">
            No Pending Offers
          </h2>
          <p className="text-sm text-muted mt-2">
            All college offers have been verified
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {unverifiedOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-display font-bold text-foreground">
                    {offer.player.firstName} {offer.player.lastName}
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    {offer.player.schoolName || "—"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide">
                        College
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {offer.collegeName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide">
                        Division
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {offer.collegeDivision}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide">
                        Type
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {offer.offerType.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide">
                        Sport
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {offer.sport}
                      </p>
                    </div>
                  </div>

                  {offer.offerDate && (
                    <p className="text-xs text-muted mt-4">
                      Offer Date: {new Date(offer.offerDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setSelectedOffer(offer.id);
                      setActionType("verify");
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    onClick={() => {
                      setSelectedOffer(offer.id);
                      setActionType("reject");
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted mt-4 pt-4 border-t border-border">
                Submitted {new Date(offer.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Verify confirmation dialog */}
      <ConfirmDialog
        open={actionType === "verify" && selectedOffer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOffer(null);
            setActionType(null);
          }
        }}
        title="Verify College Offer"
        description="This will mark the offer as verified and display it publicly on the player's profile."
        confirmLabel="Verify"
        onConfirm={async () => {
          if (selectedOffer) {
            await handleVerify(selectedOffer);
          }
        }}
      />

      {/* Reject confirmation dialog */}
      <ConfirmDialog
        open={actionType === "reject" && selectedOffer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOffer(null);
            setActionType(null);
          }
        }}
        title="Reject College Offer"
        description="This will permanently delete the offer. This action cannot be undone."
        confirmLabel="Reject"
        variant="destructive"
        onConfirm={async () => {
          if (selectedOffer) {
            await handleReject(selectedOffer);
          }
        }}
      />
    </div>
  );
}
