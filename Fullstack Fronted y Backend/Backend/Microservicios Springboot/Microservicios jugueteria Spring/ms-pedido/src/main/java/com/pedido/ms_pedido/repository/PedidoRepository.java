package com.pedido.ms_pedido.repository;


import com.pedido.ms_pedido.model.PedidoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository 
public interface PedidoRepository extends JpaRepository<PedidoModel, Long>{
    // Método útil para buscar el historial de pedidos de un usuario específico (HU56)
    List<PedidoModel> findByUsuarioId(Long usuarioId);
    
    // Método útil para buscar pedidos por su estado (HU29)
    List<PedidoModel> findByEstado(String estado);
}
