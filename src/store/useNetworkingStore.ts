import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { NetworkingContact } from "@/types/networking";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function fromDb(d: any): NetworkingContact {
  return {
    id: d.id,
    name: d.name,
    company: d.company ?? undefined,
    email: d.email ?? undefined,
    context: d.context ?? undefined,
    emailLink: d.email_link ?? undefined,
    dateSent: d.date_sent,
    followUpDate: d.follow_up_date ?? undefined,
    done: d.done,
    createdAt: d.created_at,
  };
}

function toDb(c: Partial<NetworkingContact>) {
  const r: any = {};
  if (c.name !== undefined)         r.name           = c.name;
  if (c.company !== undefined)      r.company        = c.company;
  if (c.email !== undefined)        r.email          = c.email;
  if (c.context !== undefined)      r.context        = c.context;
  if (c.emailLink !== undefined)    r.email_link     = c.emailLink;
  if (c.dateSent !== undefined)     r.date_sent      = c.dateSent;
  if (c.followUpDate !== undefined) r.follow_up_date = c.followUpDate;
  if (c.done !== undefined)         r.done           = c.done;
  // strip undefined values
  Object.keys(r).forEach((k) => r[k] === undefined && delete r[k]);
  return r;
}

export function useNetworkingStore() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<NetworkingContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!user) { setContacts([]); setIsLoading(false); return; }
      setIsLoading(true);
      const { data, error } = await supabase
        .from("networking_contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching networking contacts:", error);
        toast.error("Failed to load networking contacts");
      } else if (data) {
        setContacts(data.map(fromDb));
      }
      setIsLoading(false);
    }
    fetch();
  }, [user]);

  const addContact = useCallback(
    async (c: Omit<NetworkingContact, "id" | "createdAt">) => {
      const tempId = crypto.randomUUID();
      const tempContact: NetworkingContact = {
        ...c,
        id: tempId,
        createdAt: new Date().toISOString(),
      };
      setContacts((prev) => [tempContact, ...prev]);

      const { data, error } = await supabase
        .from("networking_contacts")
        .insert([{ ...toDb(c), user_id: user?.id }])
        .select()
        .single();

      if (error) {
        toast.error("Failed to add contact");
        setContacts((prev) => prev.filter((x) => x.id !== tempId));
      } else if (data) {
        setContacts((prev) =>
          prev.map((x) => (x.id === tempId ? fromDb(data) : x))
        );
        toast.success("Contact added");
      }
    },
    [user]
  );

  const updateContact = useCallback(
    async (id: string, updates: Partial<NetworkingContact>) => {
      setContacts((prev) =>
        prev.map((x) => (x.id === id ? { ...x, ...updates } : x))
      );
      const { error } = await supabase
        .from("networking_contacts")
        .update(toDb(updates))
        .eq("id", id);
      if (error) {
        toast.error("Failed to update contact");
      } else {
        toast.success("Saved");
      }
    },
    []
  );

  const deleteContact = useCallback(
    async (id: string) => {
      const snapshot = contacts;
      setContacts((prev) => prev.filter((x) => x.id !== id));
      const { error } = await supabase
        .from("networking_contacts")
        .delete()
        .eq("id", id);
      if (error) {
        toast.error("Failed to delete contact");
        setContacts(snapshot);
      } else {
        toast.success("Contact deleted");
      }
    },
    [contacts]
  );

  const overdueDueCount = useMemo(() => {
    const now = new Date();
    return contacts.filter((c) => {
      if (c.done) return false;
      if (!c.followUpDate) return false;
      return new Date(c.followUpDate) <= now;
    }).length;
  }, [contacts]);

  return {
    contacts,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    overdueDueCount,
  };
}
