import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Alert, Linking } from 'react-native';
import axios from 'axios';
import { Video } from 'expo-av';

import Button from '@components/Button';
import { useTheme } from '@theme/useTheme';

const baseUrl = process.env.EXPO_PUBLIC_IOT_URL;
const videoUrl = process.env.EXPO_PUBLIC_IOT_VIDEO_URL;

// ===================== TIPOS COMPARTILHADOS =====================

type StatusDoc = {
  moto_id: string;
  status?: string;
  battery?: number;
  moving?: boolean;
  reasons?: string[];
  last_update?: string;
  lat?: number;
  lon?: number;
  lng?: number;
  accel?: number;
  [key: string]: any;
};

type TelemetryDoc = {
  moto_id: string;
  type: string; // 'gps' | 'battery' | 'accel' | ...
  timestamp?: string;
  payload: any;
  [key: string]: any;
};

type EventDoc = {
  moto_id: string;
  type?: string;
  timestamp?: string;
  reason?: string;
  [key: string]: any;
};

const MOTO_IDS = ['MOTO1', 'MOTO2', 'MOTO3'];

const getStatusEmoji = (status?: string) => {
  if (!status) return '⚪';
  if (status === 'ok' || status === 'active') return '🟢';
  if (status === 'maintenance_needed' || status === 'maintenance_forced') return '🔴';
  if (status.startsWith('alert')) return '🟡';
  return '⚪';
};

const getBatteryEmoji = (battery?: number) => {
  if (battery === undefined || battery === null) return '⚪';
  if (battery >= 50) return '🟢';
  if (battery >= 20) return '🟡';
  return '🔴';
}; 

// ===================== CONTROLE DE MOTO (DASHBOARD) =====================

const IoTDashboard: React.FC<{ theme: ReturnType<typeof useTheme>['theme'] }> = ({ theme }) => {
  const [statusList, setStatusList] = useState<StatusDoc[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryDoc[]>([]);
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [selectedMoto, setSelectedMoto] = useState<string | null>(null);

  const [loadingInicial, setLoadingInicial] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [enviandoAlerta, setEnviandoAlerta] = useState(false);

  const carregarDados = async (silent = false) => {
    try {
      if (!baseUrl) {
        Alert.alert('Configuração faltando', 'EXPO_PUBLIC_IOT_URL não está definido.');
        return;
      }

      if (!silent) setRecarregando(true);

      const [statusRes, telRes, evtRes] = await Promise.all([
        axios.get<StatusDoc[]>(`${baseUrl}/api/status/all`),
        axios.get<TelemetryDoc[]>(`${baseUrl}/api/telemetry/latest?limit=200`),
        axios.get<EventDoc[]>(`${baseUrl}/api/events/latest?limit=50`),
      ]);

      const statusData = statusRes.data || [];
      setStatusList(statusData);
      setTelemetry(telRes.data || []);
      setEvents(evtRes.data || []);

      if (!selectedMoto && statusData.length > 0) {
        setSelectedMoto(statusData[0].moto_id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do IoT:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do IoT.');
    } finally {
      setLoadingInicial(false);
      setRecarregando(false);
    }
  };

  useEffect(() => {
    carregarDados(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStatus = statusList.find((s) => s.moto_id === selectedMoto);

  const telemetryForMoto = telemetry.filter((t) => t.moto_id === selectedMoto);
  const batteryTelem = telemetryForMoto.filter((t) => t.type === 'battery');
  const accelTelem = telemetryForMoto.filter((t) => t.type === 'accel');
  const gpsTelem = telemetryForMoto.filter((t) => t.type === 'gps');

  const latestBattery = batteryTelem.length
    ? batteryTelem[batteryTelem.length - 1].payload?.battery
    : undefined;

  const latestAccel = accelTelem.length
    ? accelTelem[accelTelem.length - 1].payload?.accel
    : undefined;

  const latestGps = gpsTelem.length ? gpsTelem[gpsTelem.length - 1].payload : undefined;

  const eventsForMoto = events.filter((e) => e.moto_id === selectedMoto);

  const gpsLat = latestGps?.lat !== undefined ? Number(latestGps.lat) : undefined;
  const gpsLon = latestGps?.lon !== undefined ? Number(latestGps.lon) : undefined;

  const handleOpenInMaps = () => {
    if (gpsLat === undefined || gpsLon === undefined) {
      Alert.alert('Sem localização', 'Não há dados de GPS para esta moto.');
      return;
    }
    const url = `https://www.google.com/maps?q=${gpsLat},${gpsLon}`;
    Linking.openURL(url).catch((err) => {
      console.error('Erro ao abrir mapa:', err);
      Alert.alert('Erro', 'Não foi possível abrir o mapa.');
    });
  };

  const handleSendAlert = async () => {
    if (!selectedMoto || !baseUrl) return;

    const mensagem =
      `⚠️ Alerta de problema na moto ${selectedMoto}!\n` +
      'Foi detectada uma condição de risco. Registrar alerta no sistema para acompanhamento.';

    try {
      setEnviandoAlerta(true);
      const resp = await axios.post(`${baseUrl}/api/motos/${selectedMoto}/alert`, {
        message: mensagem,
      });

      if (resp.status === 200) {
        Alert.alert(
          'Alerta registrado',
          `O alerta da moto ${selectedMoto} foi registrado e aparecerá em "Eventos recentes". ✅`,
        );
        // após registrar alerta, recarregamos eventos
        carregarDados(true);
      } else {
        Alert.alert('Erro', `Erro ao registrar alerta: ${JSON.stringify(resp.data)}`);
      }
    } catch (error) {
      console.error('Erro ao enviar alerta:', error);
      Alert.alert('Erro', 'Não foi possível registrar o alerta no backend.');
    } finally {
      setEnviandoAlerta(false);
    }
  };

  if (loadingInicial) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: theme.spacing(2), color: theme.colors.text }}>
          Carregando dados do IoT...
        </Text>
      </View>
    );
  }

  if (!statusList.length) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing(4),
          backgroundColor: theme.colors.bg,
        }}
      >
        <Text
          style={{
            fontSize: theme.font.body,
            textAlign: 'center',
            color: theme.colors.text,
          }}
        >
          Nenhuma moto disponível no momento.
        </Text>

        <View style={{ height: theme.spacing(3) }} />
        <Button title="Recarregar dados" onPress={() => carregarDados()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: theme.spacing(3),
        backgroundColor: theme.colors.bg,
      }}
    >
      {/* HEADER */}
      <Text
        style={{
          fontSize: theme.font.h2,
          fontWeight: 'bold',
          marginBottom: theme.spacing(1),
          color: theme.colors.text,
        }}
      >
        Controle de Moto
      </Text>

      {/* Moto atualmente avaliada */}
      <Text
        style={{
          fontSize: theme.font.body,
          fontWeight: '600',
          marginBottom: theme.spacing(2),
          color: theme.colors.text,
        }}
      >
        Moto atualmente avaliada: {selectedMoto ?? '-'}
      </Text>

      {/* LINHA: seleção + botão de recarregar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing(2),
        }}
      >
        <Text
          style={{
            flex: 1,
            color: theme.colors.text,
            fontWeight: '600',
          }}
        >
          Selecione a moto:
        </Text>

        <Button
          title={recarregando ? 'Atualizando...' : 'Atualizar dados'}
          onPress={() => carregarDados()}
          disabled={recarregando}
          style={{
            paddingHorizontal: theme.spacing(2),
            paddingVertical: theme.spacing(1),
          }}
        />
      </View>

      {/* CHIPS DE MOTOS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: theme.spacing(3) }}
      >
        {statusList.map((s) => {
          const isSelected = s.moto_id === selectedMoto;
          return (
            <View key={s.moto_id} style={{ marginRight: theme.spacing(1) }}>
              <Button
                title={s.moto_id}
                onPress={() => setSelectedMoto(s.moto_id)}
                variant={isSelected ? 'primary' : 'secondary'}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* CARD: STATUS GERAL */}
      {currentStatus && (
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.md,
            padding: theme.spacing(3),
            marginBottom: theme.spacing(3),
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: theme.font.h3,
              fontWeight: 'bold',
              marginBottom: theme.spacing(1),
              color: theme.colors.text,
            }}
          >
            Status geral da {currentStatus.moto_id}
          </Text>

          <Text
            style={{
              marginBottom: theme.spacing(2),
              color: theme.colors.text,
            }}
          >
            Você está visualizando os dados consolidados da moto{' '}
            <Text style={{ fontWeight: '700' }}>{currentStatus.moto_id}</Text>.
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ width: '48%', marginBottom: theme.spacing(2) }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>Status:</Text>
              <Text style={{ color: theme.colors.text }}>
                {getStatusEmoji(currentStatus.status)}{' '}
                {(currentStatus.status || 'desconhecido').toUpperCase()}
              </Text>
            </View>

            <View style={{ width: '48%', marginBottom: theme.spacing(2) }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>Bateria:</Text>
              <Text style={{ color: theme.colors.text }}>
                {getBatteryEmoji(currentStatus.battery)}{' '}
                {currentStatus.battery !== undefined
                  ? `${currentStatus.battery.toFixed(1)}%`
                  : 'N/A'}
              </Text>
            </View>

            <View style={{ width: '48%', marginBottom: theme.spacing(2) }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>Em movimento:</Text>
              <Text style={{ color: theme.colors.text }}>
                {currentStatus.moving ? 'Sim' : 'Não'}
              </Text>
            </View>

            <View style={{ width: '48%', marginBottom: theme.spacing(2) }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>
                Motivo do alerta:
              </Text>
              <Text style={{ color: theme.colors.text }}>
                {currentStatus.reasons && currentStatus.reasons.length
                  ? currentStatus.reasons.join(', ')
                  : 'Nenhum'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* CARD: TELEMETRIA RESUMIDA + LINK PRO MAPA */}
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          padding: theme.spacing(3),
          marginBottom: theme.spacing(3),
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text
          style={{
            fontSize: theme.font.h3,
            fontWeight: 'bold',
            marginBottom: theme.spacing(2),
            color: theme.colors.text,
          }}
        >
          Telemetria recente
        </Text>

        <Text style={{ fontWeight: '600', color: theme.colors.text }}>
          Último nível de bateria:
        </Text>
        <Text style={{ marginBottom: theme.spacing(1), color: theme.colors.text }}>
          {latestBattery !== undefined ? `${latestBattery.toFixed(1)}%` : 'Sem dados'}
        </Text>

        <Text style={{ fontWeight: '600', color: theme.colors.text }}>
          Última aceleração registrada:
        </Text>
        <Text style={{ marginBottom: theme.spacing(1), color: theme.colors.text }}>
          {latestAccel !== undefined ? `${latestAccel.toFixed(2)} m/s²` : 'Sem dados'}
        </Text>

        <Text style={{ fontWeight: '600', color: theme.colors.text }}>
          Última posição GPS:
        </Text>
        <Text style={{ color: theme.colors.text, marginBottom: theme.spacing(2) }}>
          {gpsLat !== undefined && gpsLon !== undefined
            ? `Lat: ${gpsLat.toFixed(5)}, Lon: ${gpsLon.toFixed(5)}`
            : 'Sem dados'}
        </Text>

        <Button
          title="Abrir no mapa (Google Maps)"
          onPress={handleOpenInMaps}
          disabled={gpsLat === undefined || gpsLon === undefined}
        />
      </View>

      {/* CARD: EVENTOS RECENTES */}
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          padding: theme.spacing(3),
          marginBottom: theme.spacing(3),
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text
          style={{
            fontSize: theme.font.h3,
            fontWeight: 'bold',
            marginBottom: theme.spacing(2),
            color: theme.colors.text,
          }}
        >
          Eventos recentes
        </Text>

        {eventsForMoto.length === 0 ? (
          <Text style={{ color: theme.colors.text }}>
            Nenhum evento registrado para esta moto.
          </Text>
        ) : (
          eventsForMoto.slice(0, 10).map((e, idx) => (
            <View
              key={`${e.moto_id}-${idx}`}
              style={{
                marginBottom: theme.spacing(1.5),
                borderBottomWidth: idx === eventsForMoto.length - 1 ? 0 : 0.5,
                borderBottomColor: theme.colors.border,
                paddingBottom: theme.spacing(1),
              }}
            >
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>
                {e.type ?? 'Evento'} {e.timestamp ? `- ${e.timestamp}` : ''}
              </Text>
              <Text style={{ color: theme.colors.text }}>
                {e.reason ?? 'Sem descrição'}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* CARD: ALERTA MANUAL */}
      <View
        style={{
          backgroundColor: '#FFF3CD',
          borderRadius: theme.radius.md,
          padding: theme.spacing(3),
          marginBottom: theme.spacing(4),
          borderWidth: 1,
          borderColor: '#FFEEBA',
        }}
      >
        <Text
          style={{
            fontSize: theme.font.h3,
            fontWeight: 'bold',
            marginBottom: theme.spacing(2),
            color: '#856404',
          }}
        >
          ⚠️ Registrar alerta manual
        </Text>
        <Text
          style={{
            marginBottom: theme.spacing(2),
            color: '#856404',
          }}
        >
          Registra um alerta no sistema para a moto selecionada. Esse alerta ficará visível na
          seção de eventos recentes.
        </Text>

        <Button
          title={
            enviandoAlerta
              ? `Registrando alerta para ${selectedMoto}...`
              : `Registrar alerta para ${selectedMoto}`
          }
          onPress={handleSendAlert}
          disabled={!selectedMoto || enviandoAlerta}
        />
      </View>
    </ScrollView>
  );
};

// ===================== CONTROLE DE ESTACIONAMENTO =====================

const IoTControl: React.FC<{ theme: ReturnType<typeof useTheme>['theme'] }> = ({ theme }) => {
  const [motoId, setMotoId] = useState<string>('MOTO1');
  const [status, setStatus] = useState<StatusDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const loadStatus = useCallback(
    async (targetId?: string) => {
      const id = targetId ?? motoId;

      if (!baseUrl) {
        Alert.alert(
          'Configuração faltando',
          'EXPO_PUBLIC_IOT_URL não está definido no .env do mobile.',
        );
        return;
      }

      setLoading(true);
      try {
        const resp = await axios.get<StatusDoc>(`${baseUrl}/api/status/${id}`);
        setStatus(resp.data);
      } catch (error) {
        console.error('Erro ao carregar status da moto:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados da moto selecionada.');
        setStatus(null);
      } finally {
        setLoading(false);
      }
    },
    [motoId],
  );

  useEffect(() => {
    loadStatus();
  }, [motoId, loadStatus]);

  const batteryText =
    status?.battery !== undefined ? `${status.battery.toFixed(1)} %` : '--';

  const latValue = status?.lat;
  const lonValue = status?.lon ?? status?.lng;

  const latText = latValue !== undefined ? latValue.toFixed(5) : '--';
  const lonText = lonValue !== undefined ? lonValue.toFixed(5) : '--';

  const accelText =
    status?.accel !== undefined ? `${status.accel.toFixed(2)} m/s²` : '--';

  const statusText = (status?.status ?? 'desconhecido').toUpperCase();

  const sendCommand = async (command: 'force_maintenance' | 'release_maintenance') => {
    if (!baseUrl) return;

    try {
      setSending(true);
      await axios.post(`${baseUrl}/api/motos/${motoId}/command`, {
        command,
        params: {},
      });

      if (command === 'force_maintenance') {
        const msg = `Moto ${motoId} enviada para manutenção.`;
        Alert.alert('Sucesso', msg);
        setLastActionMessage(msg);
      } else {
        const msg = `Moto ${motoId} enviada para estacionamento.`;
        Alert.alert('Sucesso', msg);
        setLastActionMessage(msg);
      }

      loadStatus();
    } catch (error) {
      console.error('Erro ao enviar comando:', error);
      Alert.alert('Erro', 'Não foi possível enviar o comando.');
    } finally {
      setSending(false);
    }
  };

  const goToNextMoto = () => {
    const idx = MOTO_IDS.indexOf(motoId);
    const nextMoto = MOTO_IDS[(idx + 1) % MOTO_IDS.length];
    setMotoId(nextMoto);
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: theme.spacing(3),
        backgroundColor: theme.colors.bg,
      }}
    >
      {/* Título */}
      <Text
        style={{
          fontSize: theme.font.h2,
          fontWeight: 'bold',
          marginBottom: theme.spacing(1),
          color: theme.colors.text,
        }}
      >
        Controle de Estacionamento
      </Text>

      <Text
        style={{
          fontSize: theme.font.body,
          fontWeight: '600',
          marginBottom: theme.spacing(2),
          color: theme.colors.text,
        }}
      >
        Moto selecionada: {motoId}
      </Text>

      {/* Seleção da moto atual + botão próxima */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing(3),
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: theme.font.body,
            color: theme.colors.text,
            fontWeight: '600',
          }}
        >
          Controle de posição e estado da moto no pátio.
        </Text>

        <Button
          title="Próxima moto"
          onPress={goToNextMoto}
          style={{
            paddingHorizontal: theme.spacing(2),
            paddingVertical: theme.spacing(1),
          }}
        />
      </View>

      {/* Chips de motos */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: theme.spacing(3) }}
      >
        {MOTO_IDS.map((id) => {
          const selected = id === motoId;
          return (
            <View key={id} style={{ marginRight: theme.spacing(1) }}>
              <Button
                title={id}
                onPress={() => setMotoId(id)}
                variant={selected ? 'primary' : 'secondary'}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Estatísticas */}
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          padding: theme.spacing(3),
          marginBottom: theme.spacing(3),
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text
          style={{
            fontSize: theme.font.h3,
            fontWeight: 'bold',
            marginBottom: theme.spacing(2),
            color: theme.colors.text,
          }}
        >
          Estatísticas da {motoId}
        </Text>

        {loading ? (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: theme.spacing(2),
            }}
          >
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={{ marginTop: theme.spacing(1), color: theme.colors.text }}>
              Carregando status...
            </Text>
          </View>
        ) : !status ? (
          <Text style={{ color: theme.colors.text }}>
            Não foi possível carregar os dados da moto selecionada.
          </Text>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ width: '48%', marginBottom: theme.spacing(2) }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>🔋 Bateria</Text>
              <Text style={{ color: theme.colors.text }}>{batteryText}</Text>
            </View>

            <View style={{ width: '48%', marginBottom: theme.spacing(2) }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>📍 Latitude</Text>
              <Text style={{ color: theme.colors.text }}>{latText}</Text>
            </View>

            <View style={{ width: '48%', marginBottom: theme.spacing(2) }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>📍 Longitude</Text>
              <Text style={{ color: theme.colors.text }}>{lonText}</Text>
            </View>

            <View style={{ width: '48%', marginBottom: theme.spacing(2) }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>⚡ Aceleração</Text>
              <Text style={{ color: theme.colors.text }}>{accelText}</Text>
            </View>

            <View style={{ width: '48%', marginBottom: theme.spacing(2) }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>🏷️ Status</Text>
              <Text style={{ color: theme.colors.text }}>{statusText}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Ações */}
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          padding: theme.spacing(3),
          marginBottom: theme.spacing(3),
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text
          style={{
            fontSize: theme.font.h3,
            fontWeight: 'bold',
            marginBottom: theme.spacing(2),
            color: theme.colors.text,
          }}
        >
          Ações
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ width: '48%', marginBottom: theme.spacing(2) }}>
            <Button
              title={sending ? 'Enviando...' : '🚨 Moto para manutenção'}
              onPress={() => sendCommand('force_maintenance')}
              disabled={sending}
            />
          </View>

          <View style={{ width: '48%', marginBottom: theme.spacing(2) }}>
            <Button
              title={sending ? 'Enviando...' : '🅿️ Moto para estacionamento'}
              onPress={() => sendCommand('release_maintenance')}
              disabled={sending}
            />
          </View>

          {/* Mensagem da última ação */}
          {lastActionMessage && (
            <View
              style={{
                width: '100%',
                marginTop: theme.spacing(1),
                padding: theme.spacing(2),
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.bg,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  marginBottom: theme.spacing(0.5),
                  color: theme.colors.text,
                }}
              >
                Última ação realizada
              </Text>
              <Text style={{ color: theme.colors.text }}>{lastActionMessage}</Text>
            </View>
          )}

          <View style={{ width: '100%', marginTop: theme.spacing(2) }}>
            <Text
              style={{
                fontSize: theme.font.small,
                color: theme.colors.mutedText ?? theme.colors.text,
              }}
            >
              Os comandos são enviados via MQTT para o simulador e alteram o estado da moto no
              pátio (manutenção x estacionamento).
            </Text>
          </View>
        </View>
      </View>

      {/* Visão computacional - vídeo maior + overlay de detecção */}
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          padding: theme.spacing(3),
          marginBottom: theme.spacing(4),
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text
          style={{
            fontSize: theme.font.h3,
            fontWeight: 'bold',
            marginBottom: theme.spacing(2),
            color: theme.colors.text,
          }}
        >
          🤖 Visão Computacional - Moto Estacionando
        </Text>

        {videoUrl ? (
          <View
            style={{
              height: 750,
              borderRadius: theme.radius.md,
              overflow: 'hidden',
              marginBottom: theme.spacing(2),
              position: 'relative',
            }}
          >
            <Video
              source={{ uri: videoUrl }}
              style={{ width: '100%', height: '100%' }}
              useNativeControls
              resizeMode="contain"
              isLooping
            />

            <View
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: 'rgba(0, 180, 0, 0.8)',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '700',
                }}
              >
                Moto detectada 🚲
              </Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: theme.colors.text, marginBottom: theme.spacing(2) }}>
            URL do vídeo não configurada. Defina EXPO_PUBLIC_IOT_VIDEO_URL no .env do mobile.
          </Text>
        )}

        <View
          style={{
            backgroundColor: theme.colors.bg,
            borderRadius: theme.radius.sm,
            padding: theme.spacing(2),
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              marginBottom: theme.spacing(1),
              color: theme.colors.text,
            }}
          >
            Detecção de movimento
          </Text>

          <Text style={{ color: theme.colors.text, marginBottom: theme.spacing(1) }}>
            🚲 A visão computacional identifica a moto entrando na área de estacionamento
            e destaca o veículo em tempo quase real.
          </Text>

          <Text style={{ color: theme.colors.text }}>
            No protótipo web (Streamlit + OpenCV), o texto é desenhado frame a frame
            sobre o vídeo. Aqui no app, representamos o mesmo conceito com esse overlay
            acima do vídeo.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// ===================== WRAPPER COM AS DUAS ABAS =====================

const IoT: React.FC = () => {
  const { theme } = useTheme();
  const [tab, setTab] = useState<'dashboard' | 'control'>('dashboard');

  if (!baseUrl) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing(4),
          backgroundColor: theme.colors.bg,
        }}
      >
        <Text
          style={{
            fontSize: theme.font.body,
            textAlign: 'center',
            color: theme.colors.text,
          }}
        >
          EXPO_PUBLIC_IOT_URL não está definido no .env do projeto mobile.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
      }}
    >
      {/* “Tabs” internas */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: theme.spacing(3),
          paddingTop: theme.spacing(3),
          paddingBottom: theme.spacing(1),
          backgroundColor: theme.colors.bg,
        }}
      >
        <View style={{ flex: 1, marginRight: theme.spacing(1) }}>
          <Button
            title="Controle de Moto"
            onPress={() => setTab('dashboard')}
            variant={tab === 'dashboard' ? 'primary' : 'secondary'}
          />
        </View>
        <View style={{ flex: 1, marginLeft: theme.spacing(1) }}>
          <Button
            title="Controle de Estacionamento"
            onPress={() => setTab('control')}
            variant={tab === 'control' ? 'primary' : 'secondary'}
          />
        </View>
      </View>

      {tab === 'dashboard' ? <IoTDashboard theme={theme} /> : <IoTControl theme={theme} />}
    </View>
  );
};

export default IoT;
