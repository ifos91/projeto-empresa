// =============================================
// HOOK DE MODO ADMINISTRADOR
// Gerencia estado de admin baseado na role do usuário no banco
// SEGURANÇA: Verificação feita no servidor, não no cliente
// =============================================

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminMode = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModeActive, setIsAdminModeActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário tem role de admin no banco
  const checkAdminStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setIsAdminModeActive(false);
        setLoading(false);
        return;
      }

      // Verifica role no banco de dados
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      const hasAdminRole = !!roleData && !error;
      setIsAdmin(hasAdminRole);
      
      // Se é admin, ativa automaticamente o modo admin
      if (hasAdminRole) {
        setIsAdminModeActive(true);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      setIsAdminModeActive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verifica role ao montar e quando auth muda
  useEffect(() => {
    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  // Ativar modo admin (requer que o usuário já seja admin no banco)
  // SEGURANÇA: Não aceita código, apenas verifica role no banco
  const activateAdminMode = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Verifica se tem role de admin no banco
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error verifying admin role:", error);
        return false;
      }

      if (roleData) {
        setIsAdmin(true);
        setIsAdminModeActive(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error activating admin mode:", error);
      return false;
    }
  }, []);

  // Desativar modo admin (apenas desativa a visualização, não remove a role)
  const deactivateAdminMode = useCallback(() => {
    setIsAdminModeActive(false);
  }, []);

  return {
    isAdmin,
    isAdminModeActive,
    loading,
    activateAdminMode,
    deactivateAdminMode,
  };
};
