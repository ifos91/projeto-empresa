// =============================================
// HOOK DE MODO ADMINISTRADOR
// Gerencia ativação/desativação do modo admin
// Verifica role no banco de dados
// =============================================

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminMode = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModeActive, setIsAdminModeActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      setIsAdmin(!!data && !error);
      setLoading(false);
    } catch (error) {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const activateAdminMode = async (code: string): Promise<boolean> => {
    if (code !== "2406") {
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Verificar se já tem role de admin
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (existingRole) {
        // Já é admin, apenas ativar modo
        setIsAdmin(true);
        setIsAdminModeActive(true);
        return true;
      }

      // Inserir role de admin
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: "admin" });

      if (!error) {
        setIsAdmin(true);
        setIsAdminModeActive(true);
        return true;
      }
      
      console.error("Error inserting admin role:", error);
      return false;
    } catch (error) {
      console.error("Error activating admin mode:", error);
      return false;
    }
  };

  const deactivateAdminMode = () => {
    setIsAdminModeActive(false);
  };

  return {
    isAdmin,
    isAdminModeActive,
    loading,
    activateAdminMode,
    deactivateAdminMode,
    canModify: isAdminModeActive,
  };
};
