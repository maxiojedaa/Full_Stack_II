package com.pixeltoys.ms_sistema_pagos.controller;

import com.pixeltoys.ms_sistema_pagos.model.PagoModel;
import com.pixeltoys.ms_sistema_pagos.service.PagoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    // Listar todos los pagos
    @GetMapping
    public List<PagoModel> listarPagos() {
        return pagoService.listarPagos();
    }

    // Consultar pagos asociados a un pedido
    @GetMapping("/pedido/{pedidoId}")
    public List<PagoModel> pagosPorPedido(
            @PathVariable Long pedidoId) {

        return pagoService.pagosPorPedido(pedidoId);
    }

    // Consultar pagos asociados a un usuario
    @GetMapping("/usuario/{usuarioId}")
    public List<PagoModel> pagosPorUsuario(
            @PathVariable Long usuarioId) {

        return pagoService.pagosPorUsuario(usuarioId);
    }

    // Consultar un pago por ID
    @GetMapping("/{id}")
    public PagoModel obtenerPago(@PathVariable Long id) {
        return pagoService.obtenerPago(id);
    }

    // Crear un nuevo pago
    @PostMapping
    public ResponseEntity<PagoModel> crearPago(
            @RequestBody PagoModel pago) {

        PagoModel nuevoPago = pagoService.crearPago(pago);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(nuevoPago);
    }

    // Aprobar o rechazar un pago
    @PatchMapping("/{id}/estado")
    public PagoModel actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> datos) {

        String estado = datos.get("estado");

        return pagoService.actualizarEstado(id, estado);
    }
}
