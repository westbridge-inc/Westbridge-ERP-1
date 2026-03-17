"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToasts } from "@/components/ui/Toasts";
import { api, type TeamMember, type PendingInvite } from "@/lib/api/client";

const ASSIGNABLE_ROLES = ["Admin", "Manager", "Member", "Viewer"] as const;

export function TeamTab() {
  const { addToast } = useToasts();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [inviteSending, setInviteSending] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [userLimit, setUserLimit] = useState<number | null>(null);

  const loadTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const [teamData, inviteData] = await Promise.all([
        api.team.get(),
        api.team.pendingInvites().catch(() => ({ invites: [] })),
      ]);
      setTeamMembers(teamData.members);
      setPendingInvites(inviteData.invites);
    } catch {
      setTeamMembers([]);
      setPendingInvites([]);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  // Load plan limits from usage endpoint
  useEffect(() => {
    fetch("/api/usage", { credentials: "include" })
      .then((r) => r.json())
      .then((body) => {
        const limit = body?.data?.usage?.active_users?.limit ?? null;
        setUserLimit(limit);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const currentUser = teamMembers.find((m) => m.isYou);
  const isOwner = currentUser?.role === "owner";
  const totalSlots = teamMembers.filter((m) => m.status !== "suspended").length + pendingInvites.length;
  const atLimit = userLimit !== null && totalSlots >= userLimit;

  const handleSendInvite = useCallback(async () => {
    if (!inviteEmail.trim()) return;
    setInviteSending(true);
    try {
      await api.invite.send(inviteEmail, inviteRole.toLowerCase());
      addToast(`Invitation sent to ${inviteEmail}`, "success");
      setInviteEmail("");
      setInviteRole("Member");
      await loadTeam();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to send invite", "error");
    } finally {
      setInviteSending(false);
    }
  }, [inviteEmail, inviteRole, addToast, loadTeam]);

  const handleRemove = useCallback(
    async (userId: string) => {
      setRemovingId(userId);
      try {
        await api.team.remove(userId);
        addToast("Team member removed", "success");
        setConfirmRemoveId(null);
        await loadTeam();
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Failed to remove member", "error");
      } finally {
        setRemovingId(null);
      }
    },
    [addToast, loadTeam],
  );

  const handleRoleChange = useCallback(
    async (userId: string, newRole: string) => {
      setChangingRoleId(userId);
      try {
        await api.team.updateRole(userId, newRole);
        addToast("Role updated", "success");
        await loadTeam();
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Failed to change role", "error");
      } finally {
        setChangingRoleId(null);
      }
    },
    [addToast, loadTeam],
  );

  const handleResendInvite = useCallback(
    async (inviteId: string) => {
      setResendingId(inviteId);
      try {
        await api.team.resendInvite(inviteId);
        addToast("Invite resent", "success");
        await loadTeam();
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Failed to resend invite", "error");
      } finally {
        setResendingId(null);
      }
    },
    [addToast, loadTeam],
  );

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
            {/* Plan user limit indicator */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {userLimit !== null ? (
                  <>
                    {totalSlots} of {userLimit} user{userLimit !== 1 ? "s" : ""}
                  </>
                ) : (
                  <>
                    {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}
                  </>
                )}
              </p>
              {userLimit !== null && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${atLimit ? "bg-destructive" : "bg-primary"}`}
                      style={{ width: `${Math.min(100, (totalSlots / userLimit) * 100)}%` }}
                    />
                  </div>
                  {atLimit && <span className="text-xs text-destructive font-medium">At limit</span>}
                </div>
              )}
            </div>

            {/* Team members list */}
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
                      {/* Role badge or dropdown */}
                      {isOwner && !member.isYou && member.role !== "owner" ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          disabled={changingRoleId === member.id}
                          className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground capitalize focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        >
                          {ASSIGNABLE_ROLES.map((r) => (
                            <option key={r} value={r.toLowerCase()}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground capitalize">
                          {member.role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{member.lastActive}</span>
                      {/* Remove button - not shown for owner or self */}
                      {!member.isYou && member.role !== "owner" && isOwner && (
                        <>
                          {confirmRemoveId === member.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                className="h-7 rounded-md bg-destructive px-2 text-xs text-destructive-foreground"
                                onClick={() => handleRemove(member.id)}
                                loading={removingId === member.id}
                              >
                                Confirm
                              </Button>
                              <Button
                                className="h-7 rounded-md bg-muted px-2 text-xs text-foreground"
                                onClick={() => setConfirmRemoveId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              className="h-7 rounded-md bg-muted px-2 text-xs text-foreground hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setConfirmRemoveId(member.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Pending invites section */}
            {pendingInvites.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground mb-3">Pending Invites ({pendingInvites.length})</p>
                <ul className="space-y-3">
                  {pendingInvites.map((invite) => (
                    <li key={invite.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">@</span>
                        </div>
                        <div>
                          <p className="text-sm text-foreground">{invite.email}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="capitalize">{invite.role}</span>
                            {" \u00B7 "}
                            Sent {new Date(invite.createdAt).toLocaleDateString()}
                            {" \u00B7 "}
                            Expires {new Date(invite.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="h-7 rounded-md bg-muted px-3 text-xs text-foreground"
                        onClick={() => handleResendInvite(invite.id)}
                        loading={resendingId === invite.id}
                      >
                        Resend
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Invite section */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground mb-3" id="invite-heading">
                Invite a team member
              </p>
              {atLimit ? (
                <p className="text-sm text-muted-foreground">
                  You&apos;ve reached your plan&apos;s user limit ({userLimit}).{" "}
                  <a href="/dashboard/settings?tab=billing" className="text-primary underline">
                    Upgrade your plan
                  </a>{" "}
                  to add more team members.
                </p>
              ) : (
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
                      {ASSIGNABLE_ROLES.map((r) => (
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
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
