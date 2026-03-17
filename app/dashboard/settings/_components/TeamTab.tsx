"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToasts } from "@/components/ui/Toasts";
import { api, type TeamMember } from "@/lib/api/client";

export function TeamTab() {
  const { addToast } = useToasts();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [inviteSending, setInviteSending] = useState(false);

  useEffect(() => {
    setTeamLoading(true);
    api.team
      .get()
      .then((data) => setTeamMembers(data.members))
      .catch(() => setTeamMembers([]))
      .finally(() => setTeamLoading(false));
  }, []);

  const handleSendInvite = useCallback(async () => {
    if (!inviteEmail.trim()) return;
    setInviteSending(true);
    try {
      await api.invite.send(inviteEmail, inviteRole.toLowerCase());
      addToast(`Invitation sent to ${inviteEmail}`, "success");
      setInviteEmail("");
      setInviteRole("Member");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to send invite", "error");
    } finally {
      setInviteSending(false);
    }
  }, [inviteEmail, inviteRole, addToast]);

  return (
    <Card>
      <CardContent className="p-6">
        {teamLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-44 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}
              </p>
            </div>
            {teamMembers.length > 0 && (
              <ul className="divide-y divide-border">
                {teamMembers.map((member) => (
                  <li key={member.id} className="flex items-center justify-between py-4 first:pt-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-full">
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {member.name}
                          {member.isYou && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground capitalize">
                        {member.role}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{member.lastActive}</span>
                  </li>
                ))}
              </ul>
            )}
            {/* Invite section */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground mb-3" id="invite-heading">
                Invite a team member
              </p>
              <div className="flex gap-2" role="group" aria-labelledby="invite-heading">
                <div className="flex-1">
                  <label htmlFor="invite-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="invite-role" className="sr-only">
                    Role
                  </label>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {["Member", "Admin", "Viewer"].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <Button
                  className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                  onClick={handleSendInvite}
                  loading={inviteSending}
                  disabled={!inviteEmail.trim()}
                >
                  Send invite
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
