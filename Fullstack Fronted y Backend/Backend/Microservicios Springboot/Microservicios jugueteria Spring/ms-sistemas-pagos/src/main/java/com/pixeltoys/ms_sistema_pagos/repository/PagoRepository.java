
package com.pixeltoys.ms_sistema_pagos.repository;

import com.pixeltoys.ms_sistema_pagos.model.PagoModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PagoRepository extends JpaRepository<PagoModel, Long> {

    List<PagoModel> findByPedidoId(Long pedidoId);

    List<PagoModel> findByUsuarioId(Long usuarioId);

}
