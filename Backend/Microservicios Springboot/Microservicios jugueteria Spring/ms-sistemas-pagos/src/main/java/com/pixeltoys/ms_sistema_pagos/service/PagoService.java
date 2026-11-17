package com.pixeltoys.ms_sistema_pagos.service;

import com.pixeltoys.ms_sistema_pagos.model.PagoModel;
import com.pixeltoys.ms_sistema_pagos.repository.PagoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;

    public PagoService(PagoRepository pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    // Listar todos los pagos
    public List<PagoModel> listarPagos() {
        return pagoRepository.findAll();
    }

    // Buscar un pago por su ID
    public PagoModel obtenerPago(Long id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Pago no encontrado"));
    }

    // Consultar pagos de un pedido
    public List<PagoModel> pagosPorPedido(Long pedidoId) {
        return pagoRepository.findByPedidoId(pedidoId);
    }

    // Consultar pagos de un usuario
    public List<PagoModel> pagosPorUsuario(Long usuarioId) {
        return pagoRepository.findByUsuarioId(usuarioId);
    }

    // Crear un pago
    @Transactional
    public PagoModel crearPago(PagoModel pago) {

        if (pago.getPedidoId() == null ||
            pago.getPedidoId() <= 0 ||
            pago.getUsuarioId() == null ||
            pago.getUsuarioId() <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Pedido y usuario deben ser validos");
        }

        if (pago.getMonto() == null ||
            pago.getMonto().compareTo(BigDecimal.ZERO) <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El monto debe ser mayor que cero");
        }

        if (pago.getMetodoPago() == null ||
            pago.getMetodoPago().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar un metodo de pago");
        }

        if (!pagoRepository.findByPedidoId(
                pago.getPedidoId()).isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe un pago para este pedido");
        }

        // Valores controlados por el servidor
        pago.setId(null);
        pago.setEstado("PENDIENTE");
        pago.setFechaCreacion(LocalDateTime.now());

        return pagoRepository.save(pago);
    }

    // Aprobar o rechazar un pago pendiente
    @Transactional
    public PagoModel actualizarEstado(Long id, String estado) {

        PagoModel pago = obtenerPago(id);

        if (estado == null ||
            (!estado.equalsIgnoreCase("APROBADO") &&
             !estado.equalsIgnoreCase("RECHAZADO"))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Estado no permitido");
        }

        if (!pago.getEstado().equals("PENDIENTE")) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden modificar pagos pendientes");
        }

        pago.setEstado(estado.toUpperCase());

        return pagoRepository.save(pago);
    }
}
